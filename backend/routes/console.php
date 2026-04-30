<?php

use Illuminate\Support\Facades\Schedule;

// Cek SLA tiket setiap 5 menit
Schedule::command('sla:check')->everyFiveMinutes();
