<?php

namespace App\Services;

class PriorityService
{
    private array $urgentKeywords = [
        'server down',
        'system down',
        'production down',
        'critical',
        'urgent',
        'bos marah',
        'emergency',
        'outage',
        'down',
        'crash',
        'data loss',
        'security breach',
        'all users affected',
        'company wide',
    ];

    private array $normalKeywords = [
        'cannot login',
        'login issue',
        'cant login',
        'error',
        'bug',
        'not working',
        'issue',
        'problem',
        'failed',
        'slow',
        'timeout',
    ];

    public function determinePriority(string $title, string $description): string
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