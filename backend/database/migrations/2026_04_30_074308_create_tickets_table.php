<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->string('title');
            $table->text('description');
            $table->enum('priority', ['low', 'normal', 'urgent'])->default('low');
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            $table->enum('category', ['hardware', 'software', 'network', 'account', 'other'])->default('other');
            
            // SLA fields
            $table->timestamp('sla_due_at')->nullable();
            $table->integer('sla_breached')->default(0);
            
            // Relasi ke user
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            
            // Timestamps
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('priority');
            $table->index('status');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};