# Codex - Load API keys from CODEX_HOME/.env
# Install: copy to ~/.config/fish/conf.d/codex-env.fish

set -q CODEX_HOME; or set -gx CODEX_HOME "$HOME/.codex"
if test -f "$CODEX_HOME/.env"
    # Load each export line
    for line in (grep '^export' "$CODEX_HOME/.env")
        # Parse: export KEY="value" or export KEY=value
        set -l keyval (string replace 'export ' '' $line)
        set -l key (string split -m1 '=' $keyval)[1]
        set -l val (string split -m1 '=' $keyval)[2]
        # Remove quotes if present
        set val (string trim -c '"' $val)
        set val (string trim -c "'" $val)
        # Export globally
        set -gx $key $val
    end

    # Tell bash to load .env for non-interactive shells (Codex uses bash)
    set -gx BASH_ENV "$CODEX_HOME/.env"
end
