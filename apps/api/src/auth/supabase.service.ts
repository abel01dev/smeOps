import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * SupabaseService — the only place we instantiate Supabase clients.
 *
 * Two clients:
 *   - `admin`  : uses the service role key. Bypasses RLS and can create users
 *                with `email_confirm: true`. NEVER expose this client outside
 *                the backend.
 *   - `anon`   : uses the anonymous key. Used for password-login because the
 *                admin client doesn't expose `signInWithPassword`.
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private _admin!: SupabaseClient;
  private _anon!: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const url = this.config.getOrThrow<string>("SUPABASE_URL");
    const anonKey = this.config.getOrThrow<string>("SUPABASE_ANON_KEY");
    const serviceKey = this.config.getOrThrow<string>("SUPABASE_SERVICE_ROLE_KEY");

    this._admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    this._anon = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  get admin(): SupabaseClient {
    return this._admin;
  }

  get anon(): SupabaseClient {
    return this._anon;
  }
}
