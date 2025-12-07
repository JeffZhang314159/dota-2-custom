import { BaseAbility, registerAbility } from "../../../lib/dota_ts_adapter";

@registerAbility()
export class skywrath_mage_arcane_bolt_custom extends BaseAbility {
    sound_cast: string = "Hero_SkywrathMage.ArcaneBolt.Cast";
    sound_impact: string = "Hero_SkywrathMage.ArcaneBolt.Impact";
    projectile_arcane_bolt: string = "particles/units/heroes/hero_phantom_assassin/phantom_assassin_stifling_dagger.vpcf";
    //projectile_arcane_bolt: string = "particles/units/heroes/hero_skywrath_mage/skywrath_mage_arcane_bolt.vpcf";

    OnSpellStart(): void {
        const target = this.GetCursorTarget();
        const caster = this.GetCaster();
        const bolt_speed = this.GetSpecialValueFor("bolt_speed");
        const bolt_vision = this.GetSpecialValueFor("bolt_vision");

        EmitSoundOn(this.sound_cast, caster);

        ProjectileManager.CreateTrackingProjectile({
            Ability: this,
            EffectName: this.projectile_arcane_bolt,
            Source: caster,
            Target: target,
            bDodgeable: false,
            bProvidesVision: true,
            iMoveSpeed: bolt_speed,
            iVisionRadius: bolt_vision,
            iVisionTeamNumber: caster.GetTeamNumber(),
        })
    }

    OnProjectileHit(target: CDOTA_BaseNPC | undefined, location: Vector): boolean {
        if (!target) return false;

        const caster = this.GetCaster();
        const bolt_damage = this.GetSpecialValueFor("bolt_damage");
        const bolt_vision_radius = this.GetSpecialValueFor("bolt_vision_radius");
        const vision_duration = this.GetSpecialValueFor("vision_duration");
        const int_multiplier = this.GetSpecialValueFor("int_multiplier");

        EmitSoundOn(this.sound_impact, target);

        // Give caster team vision of the target the bolt hit
        AddFOWViewer(caster.GetTeamNumber(), location, bolt_vision_radius, vision_duration, false);

        // Note: GetIntellect has a new parameter skipNoConsume
        // Idk what it does, but set to false for default behaviour
        // https://discord.com/channels/250160069549883392/1301665099034923122/1301666459940028437
        let damage = bolt_damage;
        if (caster.IsHero()) {
            damage += bolt_damage + (caster as CDOTA_BaseNPC_Hero).GetIntellect(false) * int_multiplier;
        }

        ApplyDamage({
            attacker: caster,
            victim: target,
            damage: damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this,
            damage_flags: DamageFlag.NONE,
        });
        return true;
    }
}