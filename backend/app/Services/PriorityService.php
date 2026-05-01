<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PriorityService
{
    // Keyword rules (tetap sebagai fallback)
    private array $urgentKeywords = [
        'server down', 'system down', 'production down',
        'critical', 'urgent', 'emergency', 'outage',
        'down', 'crash', 'data loss', 'security breach',
        'all users affected', 'company wide',
    ];

    private array $normalKeywords = [
        'cannot login', 'login issue', 'cant login',
        'error', 'bug', 'not working', 'issue',
        'problem', 'failed', 'slow', 'timeout',
    ];

    /**
     * Main method: try ML first, fallback to rules
     */
    public function determinePriority(string $title, string $description): string
    {
        // ── Try Machine Learning ──
        $mlResult = $this->predictWithML($title, $description);
        
        if ($mlResult && $mlResult['confidence'] >= 0.5) {
            Log::info('Priority determined by ML', [
                'title' => substr($title, 0, 50),
                'priority' => $mlResult['priority'],
                'confidence' => $mlResult['confidence'],
                'method' => 'ml'
            ]);
            return $mlResult['priority'];
        }
        
        // ── Fallback: Rule-based ──
        $priority = $this->ruleBasedPriority($title, $description);
        
        Log::info('Priority determined by rules', [
            'title' => substr($title, 0, 50),
            'priority' => $priority,
            'method' => 'rule_based'
        ]);
        
        return $priority;
    }

    /**
     * Call Python ML Service for prediction
     */
    private function predictWithML(string $title, string $description): ?array
    {
        try {
            $response = Http::timeout(3)  // Max 3 detik
                ->post('http://localhost:5000/predict', [
                    'title' => $title,
                    'description' => $description,
                ]);

            if ($response->successful()) {
                return $response->json();
            }
            
            Log::warning('ML service returned error', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
        } catch (\Exception $e) {
            Log::warning('ML service unavailable, using rule-based', [
                'error' => $e->getMessage()
            ]);
        }

        return null;
    }

    /**
     * Rule-based priority (fallback)
     */
    private function ruleBasedPriority(string $title, string $description): string
    {
        $text = strtolower($title . ' ' . $description);

        // Cek urgent keywords
        foreach ($this->urgentKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'urgent';
            }
        }

        // Cek normal keywords
        foreach ($this->normalKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return 'normal';
            }
        }

        return 'low';
    }

    public function getResponseTime(string $priority): int
    {
        return match($priority) {
            'urgent' => 2,
            'normal' => 6,
            'low' => 24,
        };
    }

    public function getSlaMessage(string $priority): string
    {
        $hours = $this->getResponseTime($priority);
        
        return match($priority) {
            'urgent' => "Respon dalam {$hours} jam - Tim akan segera menangani",
            'normal' => "Respon dalam {$hours} jam - Sedang dalam antrian",
            'low' => "Respon dalam {$hours} jam - Akan ditangani sesuai antrian",
        };
    }
}