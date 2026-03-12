-- CE SCRIPT DOIT ÊTRE EXÉCUTÉ DANS LE SQL EDITOR DE SUPABASE
-- Il permet de calculer automatiquement le score de complétion (0-100%) du profil utilisateur.

-- 1. Création de la fonction de calcul
CREATE OR REPLACE FUNCTION public.calculate_user_completion_score()
RETURNS TRIGGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Nom complet (10%)
    IF NEW.full_name IS NOT NULL AND NEW.full_name <> '' THEN score := score + 10; END IF;
    
    -- Téléphone (10%)
    IF NEW.phone IS NOT NULL AND NEW.phone <> '' THEN score := score + 10; END IF;
    
    -- Email (10%)
    IF NEW.email IS NOT NULL AND NEW.email <> '' THEN score := score + 10; END IF;
    
    -- Avatar / Photo de profil (15%)
    IF NEW.avatar IS NOT NULL AND NEW.avatar <> '' THEN score := score + 15; END IF;
    
    -- Localisation / Commune (10%)
    IF NEW.commune IS NOT NULL THEN score := score + 10; END IF;
    
    -- Profession (10%)
    IF NEW.profession IS NOT NULL AND NEW.profession <> '' THEN score := score + 10; END IF;
    
    -- Taille du foyer (10%)
    IF NEW.household_size IS NOT NULL THEN score := score + 10; END IF;
    
    -- Budget de recherche (10%)
    IF NEW.budget IS NOT NULL AND NEW.budget > 0 THEN score := score + 10; END IF;
    
    -- Documents de vérification KYC (15%)
    -- On vérifie si le tableau de documents n'est pas vide
    IF NEW.verification_documents IS NOT NULL AND array_length(NEW.verification_documents, 1) > 0 THEN 
        score := score + 15; 
    END IF;

    -- Mise à jour de la colonne
    NEW.completion_percent := score;
    
    -- Si le score est 100% et qu'il y a des documents, on peut marquer comme vérifiable
    -- (Optionnel : is_verified reste manuel par l'admin pour plus de sécurité)
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Création du Trigger
-- Il se déclenche dès qu'un champ important est modifié
DROP TRIGGER IF EXISTS tr_update_user_completion ON public.users;
CREATE TRIGGER tr_update_user_completion
    BEFORE INSERT OR UPDATE OF 
        full_name, phone, email, avatar, commune, 
        profession, household_size, budget, verification_documents
    ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_user_completion_score();

-- 3. Mise à jour massive pour les utilisateurs existants
-- Cela force le calcul pour tout le monde immédiatement
UPDATE public.users SET updated_at = NOW();

COMMENT ON FUNCTION public.calculate_user_completion_score() IS 'Calcule automatiquement le score de confiance (0-100%) basé sur les données fournies par l''utilisateur.';
