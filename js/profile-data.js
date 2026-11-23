// =========================================
// THE UNSEEN
// PROFILE DATA
// =========================================

const ProfileData = {
  getAccounts() {
    try {
      return JSON.parse(localStorage.getItem("unseenAccounts") || "{}");
    } catch (error) {
      return {};
    }
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem("unseenSession") || "null");
    } catch (error) {
      return null;
    }
  },

  getCurrentAccount() {
    const session = this.getSession();

    if (!session || !session.email) {
      return null;
    }

    const accounts = this.getAccounts();

    return accounts[session.email] || null;
  },

  saveAccount(account) {
    if (!account || !account.email) {
      return false;
    }

    const accounts = this.getAccounts();

    accounts[account.email] = account;

    try {
      localStorage.setItem("unseenAccounts", JSON.stringify(accounts));

      return true;
    } catch (error) {
      console.error("Could not save account:", error);
      return false;
    }
  },
};
