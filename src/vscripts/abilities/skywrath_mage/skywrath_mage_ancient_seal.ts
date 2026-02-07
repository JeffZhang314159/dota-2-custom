import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../lib/dota_ts_adapter";

@registerAbility()
export class skywrath_mage_ancient_seal extends BaseAbility {
    sound_cast = "Hero_SkywrathMage.AncientSeal.Target";

    OnSpellStart() {
        // Special values
        const seal_duration = this.GetSpecialValueFor("seal_duration");

        // Fetch target
        const target = this.GetCursorTarget()!;

        // Play sound
        target.EmitSound(this.sound_cast);

        // Add modifier
        target.AddNewModifier(this.GetCaster(), this, modifier_typescript_ancient_seal.name, { duration: seal_duration });
    }
}

@registerModifier()
export class modifier_typescript_ancient_seal extends BaseModifier {
    particle_seal = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_ancient_seal_debuff.vpcf";
    resist_debuff?: number;

    // When set to false, shows the modifier icon on the HUD. Otherwise, the modifier is hidden.
    IsHidden() {
        return false;
    }

    // When set to true, the outer circle of the modifier is red, indicating that the modifier is a debuff. Otherwise, the outer circle is green.
    IsDebuff() {
        return true;
    }

    // When set to true, the modifier can be purged by basic dispels.
    IsPurgable() {
        return true;
    }

    // Event call that is triggered when the modifier is created and attached to a unit.
    OnCreated() {
        // Get the ability and fetch ability specials from it
        const ability = this.GetAbility();
        if (ability) {
            this.resist_debuff = ability.GetSpecialValueFor("resist_debuff");
        }

        // Add particle effect
        const particle = ParticleManager.CreateParticle(this.particle_seal, ParticleAttachment.OVERHEAD_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControlEnt(particle, 1, this.GetParent(), ParticleAttachment.ABSORIGIN_FOLLOW, "hitloc", this.GetParent().GetAbsOrigin(), true);
        this.AddParticle(particle, false, false, -1, false, true);
    }

    CheckState() {
        return {[ModifierState.SILENCED]: true}
    }

    DeclareFunctions() {
        return [ModifierFunction.MAGICAL_RESISTANCE_BONUS];
    }

    GetModifierMagicalResistanceBonus() {
        return this.resist_debuff ?? 0;
    }
}