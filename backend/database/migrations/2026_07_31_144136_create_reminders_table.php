<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('monitoring_programs')->cascadeOnDelete();
            // 'sms' is a placeholder for a future channel; only 'whatsapp' and 'email' are implemented.
            $table->enum('channel', ['whatsapp', 'email', 'sms']);
            $table->string('frequency')->comment('daily, twice_daily, weekly');
            $table->time('time_of_day')->default('09:00:00');
            $table->text('message_template');
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamp('next_due_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reminders');
    }
};
