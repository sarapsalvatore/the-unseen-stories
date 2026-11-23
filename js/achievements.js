// =========================================
// THE UNSEEN
// ACHIEVEMENTS SYSTEM
// =========================================

const AchievementSystem = {
  definitions: [
    {
      id: "first_chapter",
      name: "First Chapter",
      description: "Finish your very first story.",
      symbol: "I",
      condition: (account) => (account.stats?.storiesRead || 0) >= 1,
    },
    {
      id: "bookworm",
      name: "Bookworm",
      description: "Finish 10 different stories.",
      symbol: "II",
      condition: (account) => (account.stats?.storiesRead || 0) >= 10,
    },
    {
      id: "story_hunter",
      name: "Story Hunter",
      description: "Finish 25 different stories.",
      symbol: "III",
      condition: (account) => (account.stats?.storiesRead || 0) >= 25,
    },
    {
      id: "night_reader",
      name: "Night Reader",
      description: "Read a story during the night.",
      symbol: "IV",
      condition: (account) => account.activity?.nightReader === true,
    },
    {
      id: "explorer",
      name: "Explorer",
      description: "Discover stories from 5 categories.",
      symbol: "V",
      condition: (account) =>
        (account.activity?.categoriesExplored?.length || 0) >= 5,
    },
    {
      id: "popular",
      name: "Popular",
      description: "Reach 100 followers.",
      symbol: "VI",
      condition: (account) => (account.stats?.followers || 0) >= 100,
    },
    {
      id: "creator",
      name: "Creator",
      description: "Publish your first story.",
      symbol: "VII",
      condition: (account) => (account.activity?.publishedStories || 0) >= 1,
    },
  ],

  check(account) {
    if (!account) return [];

    if (!Array.isArray(account.achievements)) {
      account.achievements = [];
    }

    const unlockedNow = [];

    this.definitions.forEach((achievement) => {
      const alreadyUnlocked = account.achievements.includes(achievement.id);

      if (!alreadyUnlocked && achievement.condition(account)) {
        account.achievements.push(achievement.id);
        unlockedNow.push(achievement.id);
      }
    });

    return unlockedNow;
  },

  getAll(account) {
    const unlocked = account?.achievements || [];

    return this.definitions.map((achievement) => ({
      ...achievement,
      unlocked: unlocked.includes(achievement.id),
    }));
  },
};
