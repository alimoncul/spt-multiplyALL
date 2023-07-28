import { DependencyContainer } from "tsyringe";
import https from "https";

import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ICoreConfig } from "@spt-aki/models/spt/config/ICoreConfig";
import { IQuestConfig } from "@spt-aki/models/spt/config/IQuestConfig";
import { ILocationConfig } from "@spt-aki/models/spt/config/ILocationConfig";
import { IHideoutConfig } from "@spt-aki/models/spt/config/IHideoutConfig";
import { IInRaidConfig } from "@spt-aki/models/spt/config/IInRaidConfig";

import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";

import packageJson from "../package.json";
import config from "../config.json";

class MultiplyALL implements IPostDBLoadMod {
    tables: IDatabaseTables;
    questConfig: IQuestConfig;
    coreConfig: ICoreConfig;
    lootConfig: ILocationConfig;
    raidConfig: IInRaidConfig;
    hideoutConfig: IHideoutConfig;
    configServer: ConfigServer;
    logger: any;
    public postDBLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        this.configServer = container.resolve<ConfigServer>("ConfigServer");
        this.questConfig = this.configServer.getConfig(ConfigTypes.QUEST);
        this.coreConfig = this.configServer.getConfig(ConfigTypes.CORE);
        this.lootConfig = this.configServer.getConfig(ConfigTypes.LOCATION);
        this.raidConfig = this.configServer.getConfig(ConfigTypes.IN_RAID);
        this.hideoutConfig = this.configServer.getConfig(ConfigTypes.HIDEOUT);
        this.tables = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        this.multiplyDailiesAndWeeklies();
        this.multiplyQuests();
        this.multiplyItemValues();
        this.multiplyRaidExitExperience();
        this.multiplySkillProgressionRate();
        this.multiplyWeaponSkillProgressionRate();
        this.multiplyLoots();
        this.multiplyFleaOfferCount();
        this.multiplyFenceReputation();
        this.multiplyStamina();
        this.multiplyMagazineSpeeds();
        this.multiplyHideout();
        this.multiplyKills();
        this.updateController();
    }
    updateController() {
        let data = "";
        let parsed;
        https.get({
            hostname: "api.github.com",
            path: "/repos/alimoncul/spt-multiplyALL/releases",
            method: "GET",
            headers: { "User-Agent": "MultiplyALL Version Checker" }
        }, (res) => {
            res.on("data", (chunk) => { data += chunk; });
            res.on("end", () => { try { parsed = JSON.parse(data); } catch (error) { this.logger.error(`[MultiplyALL-VersionChecker]: Could not check new versions, Error:${error}`); } });
        })
            .on("error", (e) => { this.logger.error(`[MultiplyALL-VersionChecker]: Could not check new versions, Error:${e}`); })
            .on("close", () => { 
                const latestVersionAvailable = parsed?.[0]?.tag_name;
                if (latestVersionAvailable && latestVersionAvailable !== packageJson.version) {
                    this.logger.warning("[MultiplyALL-VersionChecker]: New version available, please check the mod page!");
                }
            });
    }
    multiplyHideout() {
        if (config.hideout.stashMultiplier !== 1) {
            // 566abbc34bdc2d92178b4576 Standard stash 10x28
            // 5811ce572459770cba1a34ea Left Behind stash 10x38
            // 5811ce662459770f6f490f32 Prepare for escape stash 10x48
            // 5811ce772459770e9e5f9532 Edge of darkness stash 10x68
            try {
                this.tables.templates.items["566abbc34bdc2d92178b4576"]._props.Grids[0]._props.cellsV = Math.round(this.tables.templates.items["566abbc34bdc2d92178b4576"]._props.Grids[0]._props.cellsV * config.hideout.stashMultiplier);
                this.tables.templates.items["5811ce572459770cba1a34ea"]._props.Grids[0]._props.cellsV = Math.round(this.tables.templates.items["5811ce572459770cba1a34ea"]._props.Grids[0]._props.cellsV * config.hideout.stashMultiplier);
                this.tables.templates.items["5811ce662459770f6f490f32"]._props.Grids[0]._props.cellsV = Math.round(this.tables.templates.items["5811ce662459770f6f490f32"]._props.Grids[0]._props.cellsV * config.hideout.stashMultiplier);
                this.tables.templates.items["5811ce772459770e9e5f9532"]._props.Grids[0]._props.cellsV = Math.round(this.tables.templates.items["5811ce772459770e9e5f9532"]._props.Grids[0]._props.cellsV * config.hideout.stashMultiplier);
                this.logger.info(`[MultiplyALL-HIDEOUT]: Stash size multiplied by ${config.hideout.stashMultiplier}, New sizes: Standard stash(10x${this.tables.templates.items["566abbc34bdc2d92178b4576"]._props.Grids[0]._props.cellsV}) Left Behind stash(10x${this.tables.templates.items["5811ce572459770cba1a34ea"]._props.Grids[0]._props.cellsV}) Prepare for escape stash(10x${this.tables.templates.items["5811ce662459770f6f490f32"]._props.Grids[0]._props.cellsV}) Edge of darkness stash(10x${this.tables.templates.items["5811ce772459770e9e5f9532"]._props.Grids[0]._props.cellsV})`);
            } catch (error) {
                this.logger.error(`[MultiplyALL-HIDEOUT]: Error occurred while multiplying stash, Error: ${error}`);
            }
        }
        if (config.hideout.productionSpeedMultiplier !== 1) {
            for (let i = 0; i < this.tables.hideout.production.length; i+=1) {
                this.tables.hideout.production[i].productionTime = Math.round(this.tables.hideout.production[i].productionTime / config.hideout.productionSpeedMultiplier);
            }
            this.logger.info(`[MultiplyALL-HIDEOUT]: Production speed multiplied by ${config.hideout.productionSpeedMultiplier}`);
        }
        if (config.hideout.fuelUsageMultiplier !== 1) {
            this.tables.hideout.settings.generatorFuelFlowRate = this.tables.hideout.settings.generatorFuelFlowRate * config.hideout.fuelUsageMultiplier;
            this.logger.info(`[MultiplyALL-HIDEOUT]: Fuel flow rate multiplied by ${config.hideout.fuelUsageMultiplier}`);
        }
    }
    multiplyMagazineSpeeds() {
        if (config.ammo.magazineLoadSpeedMultiplier !== 1) {
            this.tables.globals.config.BaseLoadTime /= config.ammo.magazineLoadSpeedMultiplier;
            this.logger.info(`[MultiplyALL-AMMO]: Magazine load time multiplied by: ${config.ammo.magazineLoadSpeedMultiplier}`);
        }
        if (config.ammo.magazineUnloadSpeedMultiplier !== 1) {
            this.tables.globals.config.BaseUnloadTime /= config.ammo.magazineUnloadSpeedMultiplier;
            this.logger.info(`[MultiplyALL-AMMO]: Magazine unload time multiplied by: ${config.ammo.magazineUnloadSpeedMultiplier}`);
        }
    }
    multiplyStamina() {
        if (config.stamina.capacityMultiplier !== 1) {
            this.tables.globals.config.Stamina.Capacity = Math.round(this.tables.globals.config.Stamina.Capacity * config.stamina.capacityMultiplier);
            this.logger.info(`[MultiplyALL-STAMINA]: Capacity multiplied by: ${config.stamina.capacityMultiplier} | New Capacity: ${this.tables.globals.config.Stamina.Capacity}`);
        }
    }
    multiplyFenceReputation() {
        if (config.reputation.carExtractMultiplier !== 1) {
            this.raidConfig.carExtractBaseStandingGain *= config.reputation.carExtractMultiplier;
            this.logger.info(`[MultiplyALL-REPUTATION]: carExtractBaseStandingGain multiplied by: ${config.reputation.carExtractMultiplier}`);
        }
        if (config.reputation.scavExtractMultiplier !== 1) {
            this.raidConfig.scavExtractGain *= config.reputation.scavExtractMultiplier;
            this.logger.info(`[MultiplyALL-REPUTATION]: scavExtractGain multiplied by: ${config.reputation.scavExtractMultiplier}`);
        }
    }
    multiplyFleaOfferCount() {
        if (config.flea.offerCountMultiplier !== 1) { 
            if (config.flea.offerCountMultiplier % 1 !== 0) {
                this.logger.error("[MultiplyALL-FLEA]: offerCountMultiplier set as a float, it is not supported please set it as integer. Example values: 2, 4, 5, 10");
            } else {
                for (let i = 0; i < this.tables.globals.config.RagFair.maxActiveOfferCount.length; i+=1 ) {
                    this.tables.globals.config.RagFair.maxActiveOfferCount[i].count *= config.flea.offerCountMultiplier;
                }
                this.logger.info(`[MultiplyALL-FLEA]: MaxActiveOfferCount multiplied by: ${config.flea.offerCountMultiplier}`);
            }
        }
    }
    multiplyLoots() {
        if (config.loot.staticLootMultiplier !== 1) {
            for (const i in this.lootConfig.staticLootMultiplier) {
                this.lootConfig.staticLootMultiplier[i] *= config.loot.staticLootMultiplier;
            }
            this.logger.info(`[MultiplyALL-LOOT]: StaticLoot multiplied by: ${config.loot.staticLootMultiplier}`);
        }
        if (config.loot.looseLootMultiplier !== 1) {
            for (const i in this.lootConfig.looseLootMultiplier) {
                this.lootConfig.looseLootMultiplier[i] *= config.loot.looseLootMultiplier;
            }
            this.logger.info(`[MultiplyALL-LOOT]: LooseLoot multiplied by: ${config.loot.looseLootMultiplier}`);
        }
    }
    multiplyWeaponSkillProgressionRate() {
        if (config.experience.weaponSkillMultiplier !== 1) {
            this.tables.globals.config.SkillsSettings.WeaponSkillProgressRate *= config.experience.weaponSkillMultiplier;
            this.logger.info(`[MultiplyALL-XP]: WeaponSkillProgression multiplied by: ${config.experience.weaponSkillMultiplier}`);
        }
    }
    multiplySkillProgressionRate() {
        if (config.experience.skillMultiplier !== 1) {
            this.tables.globals.config.SkillsSettings.SkillProgressRate *= config.experience.skillMultiplier;
            this.tables.globals.config.SkillMinEffectiveness = 1;
            this.tables.globals.config.SkillFatiguePerPoint = 1;
            this.tables.globals.config.SkillFreshEffectiveness = 1;
            this.logger.info(`[MultiplyALL-XP]: SkillProgression multiplied by: ${config.experience.skillMultiplier}`);
        }
    }
    multiplyRaidExitExperience() {
        if (config.experience.raidExitMultiplier !== 1) {
            this.tables.globals.config.exp.match_end.survived_exp_reward = Math.round(this.tables.globals.config.exp.match_end.survived_exp_reward * config.experience.raidExitMultiplier);
            this.tables.globals.config.exp.match_end.mia_exp_reward = Math.round(this.tables.globals.config.exp.match_end.mia_exp_reward * config.experience.raidExitMultiplier);
            this.tables.globals.config.exp.match_end.runner_exp_reward = Math.round(this.tables.globals.config.exp.match_end.runner_exp_reward * config.experience.raidExitMultiplier);
            this.logger.info(`[MultiplyALL-XP]: RaidExitExperience multiplied by: ${config.experience.raidExitMultiplier}`);
        }
    }
    multiplyKills() {
        if (config.experience.killMultiplier !== 1) {
            this.tables.globals.config.exp.kill.victimLevelExp = Math.round(this.tables.globals.config.exp.kill.victimLevelExp * config.experience.killMultiplier);
            this.tables.globals.config.exp.kill.expOnDamageAllHealth = Math.round(this.tables.globals.config.exp.kill.expOnDamageAllHealth * config.experience.killMultiplier);
            this.tables.globals.config.exp.kill.longShotDistance = Math.round(this.tables.globals.config.exp.kill.longShotDistance * config.experience.killMultiplier);
            this.tables.globals.config.exp.kill.victimBotLevelExp = Math.round(this.tables.globals.config.exp.kill.victimBotLevelExp * config.experience.killMultiplier);
            this.logger.info(`[MultiplyALL-XP]: KillExperience multiplied by: ${config.experience.killMultiplier}`);
        }
    }
    multiplyItemValues() {
        const items = this.tables.templates.items;
        let examineExperienceUpdated = 0;
        let armorDurabilityUpdated = 0;
        const examineMultiplierEdited = config.experience.examineMultiplier !== 1;
        const armorMultiplierEdited = config.durability.armorMultiplier !== 1;
        if (examineMultiplierEdited || armorMultiplierEdited) {
            for (let i = 0; i < Object.keys(items).length; i+=1) {
                const item = items[Object.keys(items)[i]];
                if (examineMultiplierEdited) {
                    const examineExperience = item?._props?.ExamineExperience;
                    if (examineExperience >= 0) {
                        items[Object.keys(items)[i]]._props.ExamineExperience = Math.round(examineExperience * config.experience.examineMultiplier);
                        examineExperienceUpdated +=1;
                    }
                }
                if (armorMultiplierEdited) {
                    const isItemHasAProtection = item?._props?.armorZone?.length;
                    if (isItemHasAProtection) {
                        const stockDurability = item._props.Durability;
                        items[Object.keys(items)[i]]._props.Durability = Math.round(stockDurability * config.durability.armorMultiplier);
                        items[Object.keys(items)[i]]._props.MaxDurability = items[Object.keys(items)[i]]._props.Durability;
                        armorDurabilityUpdated += 1;
                    }
                }
            }
            if (examineExperienceUpdated > 0) {
                this.logger.info(`[MultiplyALL-XP]: ExamineExperience multiplied by: ${config.experience.examineMultiplier}, Total Items Updated: ${examineExperienceUpdated}`);
            }
            if (armorDurabilityUpdated > 0) {
                this.logger.info(`[MultiplyALL-DURABILITY]: Armor durabilities multiplied by: ${config.durability.armorMultiplier}, Total Items Updated: ${armorDurabilityUpdated}`);
            }
        }
    }
    multiplyQuests() {
        const quests = this.tables.templates.quests;
        let updatedQuestExperience = 0;
        let updatedQuestReputation = 0;
        if (config.experience.questMultiplier !== 1 || config.reputation.questMultiplier !== 1) {
            for (let i = 0; i < Object.keys(quests).length; i+=1) {
                const quest = quests[Object.keys(quests)[i]];
                const experienceRewardIndex = quest?.rewards?.Success?.findIndex?.((s) => s.type === "Experience");
                const reputationRewardIndex = quest?.rewards?.Success?.findIndex?.((s) => s.type === "TraderStanding");
                if (experienceRewardIndex >= 0 && config.experience.questMultiplier !== 1) {
                    const reward = quest.rewards.Success[experienceRewardIndex];
                    reward.value = Math.round(parseInt(reward.value.toString()) * config.experience.questMultiplier).toString();
                    quests[Object.keys(quests)[i]].rewards.Success[experienceRewardIndex] = reward;
                    updatedQuestExperience += 1;
                }
                if (reputationRewardIndex && config.reputation.questMultiplier !== 1) {
                    const reputation = quest.rewards.Success[reputationRewardIndex];
                    if (reputation?.value) {
                        reputation.value = (parseFloat(reputation.value.toString()) * config.reputation.questMultiplier).toString();
                        quests[Object.keys(quests)[i]].rewards.Success[reputationRewardIndex] = reputation;
                        updatedQuestReputation += 1;
                    }
                }
            }
            this.logger.info(`[MultiplyALL-XP]: Quests experience multiplied by: ${config.experience.questMultiplier}, Total Quests Updated: ${updatedQuestExperience}`);
            this.logger.info(`[MultiplyALL-XP]: Quests reputation multiplied by: ${config.reputation.questMultiplier}, Total Quests Updated: ${updatedQuestReputation}`);
        }
    }
    multiplyDailiesAndWeeklies() { 
        const dailies = this.questConfig.repeatableQuests[0];
        const weeklies = this.questConfig.repeatableQuests[1];
        const dailiesScav = this.questConfig.repeatableQuests[2];

        if (config.experience.dailyWeeklyMultiplier !== 1) {
            if (dailies.rewardScaling?.experience?.length) {
                dailies.rewardScaling.experience = dailies.rewardScaling.experience.map((exp) => Math.round(exp * config.experience.dailyWeeklyMultiplier));
                this.logger.info(`[MultiplyALL-XP]: Dailies multiplied by: ${config.experience.dailyWeeklyMultiplier}`);
            }
    
            if (weeklies.rewardScaling?.experience?.length) {
                weeklies.rewardScaling.experience = weeklies.rewardScaling.experience.map((exp) => Math.round(exp * config.experience.dailyWeeklyMultiplier));
                this.logger.info(`[MultiplyALL-XP]: Weeklies multiplied by: ${config.experience.dailyWeeklyMultiplier}`);
            }
    
            if (dailiesScav.rewardScaling?.experience?.length) {
                dailiesScav.rewardScaling.experience = dailiesScav.rewardScaling.experience.map((exp) => Math.round(exp * config.experience.dailyWeeklyMultiplier));
                this.logger.info(`[MultiplyALL-XP]: Dailies [Scav] multiplied by: ${config.experience.dailyWeeklyMultiplier}`);
            }
        }

        if (config.money.dailyWeeklyMultiplier !== 1) {
            if (dailies.rewardScaling?.roubles?.length) {
                dailies.rewardScaling.roubles = dailies.rewardScaling.roubles.map((exp) => Math.round(exp * config.money.dailyWeeklyMultiplier));
                this.logger.info(`[MultiplyALL-ROUBLES]: Dailies multiplied by: ${config.money.dailyWeeklyMultiplier}`);
            }
    
            if (weeklies.rewardScaling?.roubles?.length) {
                weeklies.rewardScaling.roubles = weeklies.rewardScaling.roubles.map((exp) => Math.round(exp * config.money.dailyWeeklyMultiplier));
                this.logger.info(`[MultiplyALL-ROUBLES]: Weeklies multiplied by: ${config.money.dailyWeeklyMultiplier}`);
            }
    
            if (dailiesScav.rewardScaling?.roubles?.length) {
                dailiesScav.rewardScaling.roubles = dailiesScav.rewardScaling.roubles.map((exp) => Math.round(exp * config.money.dailyWeeklyMultiplier));
                this.logger.info(`[MultiplyALL-ROUBLES]: Dailies [Scav] multiplied by: ${config.money.dailyWeeklyMultiplier}`);
            }
        }

        if (config.reputation.dailyWeeklyMultiplier !== 1) {
            if (dailies.rewardScaling?.reputation?.length) {
                dailies.rewardScaling.reputation = dailies.rewardScaling.reputation.map((exp) => exp * config.reputation.dailyWeeklyMultiplier);
                this.logger.info(`[MultiplyALL-REPUTATION]: Dailies multiplied by: ${config.reputation.dailyWeeklyMultiplier}`);
            }
    
            if (weeklies.rewardScaling?.reputation?.length) {
                weeklies.rewardScaling.reputation = weeklies.rewardScaling.reputation.map((exp) => exp * config.reputation.dailyWeeklyMultiplier);
                this.logger.info(`[MultiplyALL-REPUTATION]: Weeklies multiplied by: ${config.reputation.dailyWeeklyMultiplier}`);
            }
    
            if (dailiesScav.rewardScaling?.reputation?.length) {
                dailiesScav.rewardScaling.reputation = dailiesScav.rewardScaling.reputation.map((exp) => exp * config.reputation.dailyWeeklyMultiplier);
                this.logger.info(`[MultiplyALL-REPUTATION]: Dailies [Scav] multiplied by: ${config.reputation.dailyWeeklyMultiplier}`);
            }
        }
    }
}

module.exports = { mod: new MultiplyALL() };