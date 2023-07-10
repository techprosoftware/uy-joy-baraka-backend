const { Sequelize } = require("sequelize");
const { DB_URL, DEV_DB_URL, NODE_ENV } = require("../config");

const Model = require("../models/models");
const {generateHash} = require("./bcrypt");

const sequelize = new Sequelize(
  NODE_ENV === "production" ? DB_URL : DEV_DB_URL,
  { logging: false }
);

module.exports = async function () {
  try {
    const db = {};

    db.users = await Model.Users(Sequelize, sequelize);
    db.attempts = await Model.Attempts(Sequelize, sequelize);
    db.sessions = await Model.Sessions(Sequelize, sequelize);
    db.bans = await Model.Bans(Sequelize, sequelize);
    db.announcement = await Model.Announcements(Sequelize, sequelize);
    db.likes = await Model.Likes(Sequelize, sequelize);
    db.logins = await Model.UserLogins(Sequelize, sequelize);
    db.messages = await Model.Messages(Sequelize, sequelize);
    db.chats = await Model.Chats(Sequelize, sequelize);

    await db.users.hasOne(db.attempts, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.attempts.belongsTo(db.users, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.users.hasOne(db.bans, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.bans.belongsTo(db.users, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.users.hasMany(db.sessions, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.sessions.belongsTo(db.users, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.users.hasMany(db.announcement, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.announcement.belongsTo(db.users, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.users.hasMany(db.likes, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.likes.belongsTo(db.users, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.announcement.hasMany(db.likes, {
      foreignKey: {
        name: "announcement_id",
        allowNull: false,
      },
    });

    await db.likes.belongsTo(db.announcement, {
      foreignKey: {
        name: "announcement_id",
        allowNull: false,
      },
    });

    await db.users.hasMany(db.logins, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.logins.belongsTo(db.users, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.users.hasMany(db.chats, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.chats.belongsTo(db.users, {
      foreignKey: {
        name: "user_id",
        allowNull: false,
      },
    });

    await db.chats.hasMany(db.messages, {
      foreignKey: {
        name: "chat_id",
        allowNull: true,
      },
    });

    await db.messages.belongsTo(db.chats, {
      name: "chat_id",
      allowNull: true,
    });

    // let admin = await db.users.findOne({ where: { role: "admin" }, raw: true });
    // await db.users.destroy({ where: { role: "admin" } })
    // if (!admin) {
    //   const readline = require("readline");
    //
    //   const rl = readline.createInterface({
    //     input: process.stdin,
    //     output: process.stdout,
    //   });
    //
    //   let admin = {
    //     full_name: "Admin",
    //     role: "admin",
    //     confirm: true,
    //   };
    //
    //   rl.question("Telefon raqamingizni kiriting: ", (phone) => {
    //     admin.phone = phone;
    //
    //     rl.question("Parolingizni kiriting: ", async (password) => {
    //       admin.password = await generateHash(password);
    //
    //       console.log(admin);
    //       await db.users.create(admin);
    //       console.log("Admin muvaffaqiyatli yaratildi");
    //
    //       rl.close();
    //     });
    //   });
    // }

    await sequelize.sync({ force: false });
    // await sequelize.sync({ alter: true });
    return db;
  } catch (e) {
    console.log(e);
  }
};
