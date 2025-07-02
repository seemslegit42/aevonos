# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
    pkgs.pnpm
  ];
  # Sets environment variables in the workspace
  env = {
    FIREWORKS_API_KEY = "FIREWORKS_API_KEY=fw_3Zg4q1qterY8Rt2y5t1n7LTJ";
    AUTH_ENDPOINT = "https://example.com/auth";
    MISTRAL_API_KEY = "Xt3BO0zeSa95yBe3fJK3TZ3JE7sbsrbn";
    MAILGUN_API_KEY = "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";
    GEMINI_API_KEY = "AIzaSyDoV69so7W-FW3kmrkO1gDJnf7LtR874Bc";    
    FIRECRAWL_API_KEY = "fc-a417cfcf0b914726aa7321a096bda5f8";
    RESEND_API_KEY = "re_31eAoq3L_ChcDHyQERbf3442BvVMZATRP";
    AUTH_SECRET = "db2c355d6e31407698fc6ec535472e08b4b4a2235903e4dc96febdde31c818b1";
    OPENAI_API_KEY = "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";
    DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWUozNDdRTjJIRkoyRFhWTVY1NEE2TVkiLCJ0ZW5hbnRfaWQiOiIwN2Q5Mzg4NzRlOGU5Y2MwMjIyNTc2NWJjODI1MWNjYTIxNTc5ZTJiNjYxYzc4MzhmOTc0YjBmMjA3NWY5OTlkIiwiaW50ZXJuYWxfc2VjcmV0IjoiZjhjNmNiZDctMmVmZC00ZmNlLTg1ZDAtYzFmZDE5ZTg3MzM1In0.uG__IcW8vKiPUteC3GpdCSEg7-zGJROqk5rJi3-LDNA";
    VERCEL_ACCESS_TOKEN = "0DWqOW8RAXmJ0SWlhUAz6hFP";
    GROQ_API_KEY = "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";
    PRISMA_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWFI3TkJGTUMzUFY5WTBNR1ZRUFExWEUiLCJ0ZW5hbnRfaWQiOiIyNGQ0NTc5Zjc0YjgxM2QzMTdiMTBhYzZkOWVlYzFhZDhjM2M3YWNjZWNmN2U4NDVkYzk1MmU1ODViMzgzMjFlIiwiaW50ZXJuYWxfc2VjcmV0IjoiODdlZGZmMTItZjdkMS00Mjk0LWJiZmUtZTQ0NmM3YmNiNTBhIn0.n8vKDER7ceQCcrci6BTusXZfqdOS_zakyYMS5h4b6Jw";
    SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsbWh2YmhxZ29jcGdxYmFrcWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjQ3ODIsImV4cCI6MjA2NDYwMDc4Mn0.7dUrOUeqMnr5Yw9Xnr_cO4mHxlJdJEg5hWI69He5Zgg";
    HUGGING_FACE_TOKEN = "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";
    ANTHROPIC_API_KEY = "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";
    AUTH_API_KEY = "db2c355d6e31407698fc6ec535472e08b4b4a2235903e4dc96febdde31c818b1";
    SLACK_API_KEY = "xoxb-8956017572677-8982036303072-lLtci47IQqavo7Op5wA6KeKX";
    AUTH_URL="http://localhost:3000";
    FINNHUB_API_KEY="d1i3rj9r01qhsrhd67a0d1i3rj9r01qhsrhd67ag";
    ABSTRACT_API_KEY="74072bd4569540e9a679647613e26ce6";
  };
  # This adds a file watcher to startup the firebase emulators. The emulators will only start if
  # a firebase.json file is written into the user's directory
  services.firebase.emulators = {
    detect = true;
    projectId = "demo-app";
    services = ["auth" "firestore"];
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
          "src/app/login/page.tsx"
        ];
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["pnpm" "dev"];
          manager = "web";
        };
      };
    };
  };
}
