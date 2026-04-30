<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action'); // created, updated, status_changed, assigned, comment
            $table->text('description')->nullable();
            $table->json('changes')->nullable(); // menyimpan perubahan dalam JSON
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_logs');
    }
};