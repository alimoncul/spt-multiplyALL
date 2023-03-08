import { DependencyContainer } from "tsyringe";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";

import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";

import packageJson from "../package.json";
import config from "../config.json";

class MultiplyALL implements IPostDBLoadMod
{
    tables: IDatabaseTables;
    questConfig: any;
    coreConfig: any;
    lootConfig: any;
    configServer: ConfigServer;
    public postDBLoad(container: DependencyContainer): void
    {
        this.configServer = container.resolve<ConfigServer>("ConfigServer");
        this.questConfig = this.configServer.getConfig(ConfigTypes.QUEST);
        this.coreConfig = this.configServer.getConfig(ConfigTypes.CORE)
        this.lootConfig = this.configServer.getConfig(ConfigTypes.LOCATION);
        this.tables = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        this.packageChecker(container);
        this.multiplyDailiesAndWeeklies(container);
        this.multiplyQuests(container);
        this.multiplyExamineExperience(container);
        this.multiplyRaidExitExperience(container);
        this.multiplySkillProgressionRate(container);
        this.multiplyWeaponSkillProgressionRate(container);
        this.multiplyLoots(container);
    }
    multiplyLoots(container: DependencyContainer) 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        if (config.loot.staticLootMultiplier !== 1) 
        {
            for (const i in this.lootConfig.staticLootMultiplier) 
            {
                this.lootConfig.staticLootMultiplier[i] *= config.loot.staticLootMultiplier;
            }
            logger.info(`[MultiplyALL-LOOT]: StaticLoot multiplied by: ${config.loot.staticLootMultiplier}`);
        }
        if (config.loot.looseLootMultiplier !== 1) 
        {
            for (const i in this.lootConfig.looseLootMultiplier) 
            {
                this.lootConfig.looseLootMultiplier[i] *= config.loot.looseLootMultiplier;
            }
            logger.info(`[MultiplyALL-LOOT]: LooseLoot multiplied by: ${config.loot.looseLootMultiplier}`);
        }
    }
    multiplyWeaponSkillProgressionRate(container: DependencyContainer) 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        if (config.experience.weaponSkillMultiplier !== 1) 
        {
            this.tables.globals.config.SkillsSettings.WeaponSkillProgressRate *= config.experience.weaponSkillMultiplier;
            logger.info(`[MultiplyALL-XP]: WeaponSkillProgression multiplied by: ${config.experience.weaponSkillMultiplier}`);
        }
    }
    multiplySkillProgressionRate(container: DependencyContainer) 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        if (config.experience.skillMultiplier !== 1) 
        {
            this.tables.globals.config.SkillsSettings.SkillProgressRate *= config.experience.skillMultiplier;
            this.tables.globals.config.SkillMinEffectiveness = 1;
            this.tables.globals.config.SkillFatiguePerPoint = 1;
            this.tables.globals.config.SkillFreshEffectiveness = 1;
            logger.info(`[MultiplyALL-XP]: SkillProgression multiplied by: ${config.experience.skillMultiplier}`);
        }
    }
    packageChecker(container: DependencyContainer) 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const modAKIVersion = packageJson.akiVersion;
        if (modAKIVersion !== this.coreConfig.akiVersion) 
        {
            logger.info("[MultiplyALL]: You are using different AKI Version than the mod, you may experience problems. Write down this problems in support thread.");
        }
    }
    multiplyRaidExitExperience(container: DependencyContainer) 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        if (config.experience.raidExitMultiplier !== 1) 
        {
            this.tables.globals.config.exp.match_end.survived_exp_reward = Math.round(this.tables.globals.config.exp.match_end.survived_exp_reward * config.experience.raidExitMultiplier);
            this.tables.globals.config.exp.match_end.mia_exp_reward = Math.round(this.tables.globals.config.exp.match_end.mia_exp_reward * config.experience.raidExitMultiplier);
            this.tables.globals.config.exp.match_end.runner_exp_reward = Math.round(this.tables.globals.config.exp.match_end.runner_exp_reward * config.experience.raidExitMultiplier);
            logger.info(`[MultiplyALL-XP]: RaidExitExperience multiplied by: ${config.experience.raidExitMultiplier}`);
        }
    }
    multiplyExamineExperience(container: DependencyContainer) 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const items = this.tables.templates.items;
        let updated = 0;
        if (config.experience.examineMultiplier !== 1) 
        {
            for (let i = 0; i < Object.keys(items).length; i+=1) 
            {
                const item = items[Object.keys(items)[i]];
                const examineExperience = item?._props?.ExamineExperience;
                if (examineExperience >= 0) 
                {
                    items[Object.keys(items)[i]]._props.ExamineExperience = Math.round(examineExperience * config.experience.examineMultiplier);
                    updated +=1;
                }
            }
            logger.info(`[MultiplyALL-XP]: ExamineExperience multiplied by: ${config.experience.examineMultiplier}, Total Items Updated: ${updated}`);
        }
    }
    multiplyQuests(container: DependencyContainer) 
    {
        const logger = container.resolve<ILogger>("WinstonLogger");
        const quests = this.tables.templates.quests;
        let updated = 0;
        if (config.experience.questMultiplier !== 1) 
        {
            for (let i = 0; i < Object.keys(quests).length; i+=1) 
            {
                const quest = quests[Object.keys(quests)[i]];
                const experienceRewardIndex = quest?.rewards?.Success?.findIndex?.((s) => s.type === "Experience");
                if (experienceRewardIndex >= 0) 
                {
                    const reward = quest.rewards.Success[experienceRewardIndex];
                    reward.value = Math.round(parseInt(reward.value) * config.experience.questMultiplier).toString();
                    quests[Object.keys(quests)[i]].rewards.Success[experienceRewardIndex] = reward;
                    updated += 1;
                }
            }
            logger.info(`[MultiplyALL-XP]: Quests multiplied by: ${config.experience.questMultiplier}, Total Quests Updated: ${updated}`);
        }
    }
    multiplyDailiesAndWeeklies(container: DependencyContainer) 
    { 
        const logger = container.resolve<ILogger>("WinstonLogger");
        const dailies = this.questConfig.repeatableQuests[0];
        const weeklies = this.questConfig.repeatableQuests[1];
        const dailiesScav = this.questConfig.repeatableQuests[2];

        if (dailies.rewardScaling?.experience?.length) 
        {
            dailies.rewardScaling.experience = dailies.rewardScaling.experience.map((exp) => Math.round(exp * config.experience.dailyWeeklyMultiplier));
            logger.info(`[MultiplyALL-XP]: Dailies multiplied by: ${config.experience.dailyWeeklyMultiplier}`);
        }

        if (weeklies.rewardScaling?.experience?.length) 
        {
            weeklies.rewardScaling.experience = weeklies.rewardScaling.experience.map((exp) => Math.round(exp * config.experience.dailyWeeklyMultiplier));
            logger.info(`[MultiplyALL-XP]: Weeklies multiplied by: ${config.experience.dailyWeeklyMultiplier}`);
        }

        if (dailiesScav.rewardScaling?.experience?.length) 
        {
            dailiesScav.rewardScaling.experience = dailiesScav.rewardScaling.experience.map((exp) => Math.round(exp * config.experience.dailyWeeklyMultiplier));
            logger.info(`[MultiplyALL-XP]: Dailies [Scav] multiplied by: ${config.experience.dailyWeeklyMultiplier}`);
        }
    }
}

module.exports = { mod: new MultiplyALL() }