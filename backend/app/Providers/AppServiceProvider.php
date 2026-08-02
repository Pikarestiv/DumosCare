<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Namecheap's MySQL/MariaDB defaults don't support the full
        // 767/1000-byte index key length utf8mb4 varchar(255) needs,
        // causing "Specified key was too long" on migrations like
        // password_reset_tokens. 191 * 4 bytes stays under the limit.
        Schema::defaultStringLength(191);
    }
}
