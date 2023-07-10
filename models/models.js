module.exports = class Models {
    static async Users(Sequelize, sequelize) {
        return sequelize.define('users', {
            user_id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                primaryKey: true,
            },
            full_name: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: Sequelize.DataTypes.STRING(12),
                is: /^998[389][01345789][0-9]{7}$/,
                unique: true,
                allowNull: false,
            },
            address: {
                type: Sequelize.DataTypes.STRING,
            },
            role: {
                type: Sequelize.DataTypes.STRING(5),
                isIn: [["user", "admin"]],
                defaultValue: "user",
            },
            user_attempts: {
                type: Sequelize.DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 0,
            },
            avatar: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                defaultValue: "default.png",
            },
            password: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            confirm: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            socket_id: {
                type: Sequelize.DataTypes.STRING,
            },
            status: {
                type: Sequelize.DataTypes.STRING(7),
                isIn: [["online", "offline"]],
                defaultValue: "offline",
                allowNull: false,
            },
        });
    }

    static async Attempts(Sequelize, sequelize) {
        return sequelize.define("attempts", {
            attempt_id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                primaryKey: true,
            },
            code: {
                type: Sequelize.DataTypes.STRING(64),
                allowNull: false,
            },
            attempts: {
                type: Sequelize.DataTypes.SMALLINT,
                allowNull: false,
                defaultValue: 1,
            }
        })
    }

    static async Bans(Sequelize, sequelize) {
        return sequelize.define("bans", {
            ban_id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                primaryKey: true,
            },
            expire_date: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            }
        })
    }

    static async Sessions(Sequelize, sequelize) {
        return sequelize.define("sessions", {
            session_id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_agent: {
                type: Sequelize.DataTypes.STRING(256),
                allowNull: false,
            },
            ip_address: {
                type: Sequelize.DataTypes.INET,
                allowNull: false,
            },
        });
    }

    static async Announcements(Sequelize, sequelize) {
        return sequelize.define("announcements", {
            announcement_id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                primaryKey: true,
            },
            slug: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            title: {
                type: Sequelize.DataTypes.STRING(256),
                allowNull: false,
            },
            thumb: {
                type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
                allowNull: false,
            },
            city: {
                type: Sequelize.DataTypes.STRING(255),
                allowNull: false,
            },
            district: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: Sequelize.DataTypes.STRING(4),
                isIn: [['rent', 'sale']],
                defaultValue: "rent",
                allowNull: false,
            },
            description: {
                type: Sequelize.DataTypes.TEXT,
                allowNull: false,
            },
            price: {
                type: Sequelize.DataTypes.FLOAT,
                allowNull: false,
            },
            price_type: {
                type: Sequelize.DataTypes.STRING(6),
                isIn: [['sum', 'dollar']],
                defaultValue: "sum",
                allowNull: false,
            },
            status: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            confirm: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            likeCount: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 0
            },
            viewCount: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 0
            },
            rec: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
            },
        });
    }

    static async Likes(Sequelize, sequelize) {
        return sequelize.define("likes", {
            like_id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4(),
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
            },
            announcement_id: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
            },
            date: {
                type: Sequelize.DataTypes.DATE,
                defaultValue: Sequelize.DataTypes.NOW,
            },
        });
    }

    static async UserLogins(Sequelize, sequelize) {
        return sequelize.define('user_logins', {
            id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4(),
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.DataTypes.UUID,
                allowNull: false,
            },
            user_agent: {
                type: Sequelize.DataTypes.STRING(256),
                allowNull: false,
            },
            ip_address: {
                type: Sequelize.DataTypes.INET,
                allowNull: false,
            },
        });
    };

    static async Chats(Sequelize, sequelize) {
        return sequelize.define("chats", {
            chat_id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                primaryKey: true,
            },
            announcement_id: {
                type: Sequelize.DataTypes.STRING,
            },
            title: {
                type: Sequelize.DataTypes.STRING,
            },
            receiver_id: {
                type: Sequelize.DataTypes.UUID,
            },
        });
    }

    static async Messages(Sequelize, sequelize) {
        return sequelize.define('messages', {
            message_id: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                primaryKey: true,
            },
            sender_id: {
                type: Sequelize.DataTypes.UUID,
            },
            content: {
                type: Sequelize.DataTypes.TEXT,
                allowNull: false,
            },
            read: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            timestamp: {
                type: Sequelize.DataTypes.DATE,
                defaultValue: Sequelize.DataTypes.NOW,
                allowNull: false,
            },
        });
    };
}