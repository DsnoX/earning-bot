require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();

// 🌐 Uptime server
app.get("/", (req, res) => res.send("Bot Running 🚀"));
app.listen(3000);

// 🧠 Simple DB
let users = {};

// 🎯 Offers
const offers = [
  {
    id: 1,
    name: "Slice Offer",
    reward: 150,
    link: "https://t.sliceit.com/s?c=irYwC_h&ic=DSNOX46416"
  },
  {
    id: 2,
    name: "TaskBucks",
    reward: 50,
    link: "http://tbk.bz/jf3gjkc9"
  },
  {
    id: 3,
    name: "Upstox",
    reward: 120,
    link: "https://upstox.onelink.me/0H1s/5GCLUE"
  }
];

// 🔥 START + REFERRAL
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const id = msg.from.id;
  const ref = match[1];

  if (!users[id]) {
    users[id] = { balance: 0, refs: 0 };

    if (ref && ref != id && users[ref]) {
      users[ref].refs += 1;
    }
  }

  bot.sendMessage(id,
`👋 Welcome!

💰 Earn money by completing simple tasks  
⚡ Fast rewards & easy system  

👇 Tap below to start`,
    mainMenu()
  );
});

// 📱 MENU
function mainMenu() {
  return {
    reply_markup: {
      keyboard: [
        ["🎯 Earn Money"],
        ["💰 Balance", "💸 Withdraw"]
      ],
      resize_keyboard: true
    }
  };
}

// 🎯 SHOW OFFERS
bot.onText(/🎯 Earn Money/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `🔥 Featured Offers\n\nTap any offer to start earning 👇`,
    {
      reply_markup: {
        inline_keyboard: offers.map(o => ([
          { text: `💰 ₹${o.reward} - ${o.name}`, callback_data: `offer_${o.id}` }
        ]))
      }
    }
  );
});

// 📄 OFFER DETAILS PAGE
bot.on("callback_query", (q) => {
  const id = q.from.id;
  const data = q.data;

  if (!users[id]) return;

  if (data.startsWith("offer_")) {
    const offerId = parseInt(data.split("_")[1]);
    const offer = offers.find(o => o.id === offerId);

    let message = "";

    // 🔥 Slice Offer (Custom)
    if (offer.id === 1) {
      message =
`🔥 Slice Offer - Earn ₹${offer.reward}

💳 Switched to slice for daily banking.

Get upto 3% cashback even on a ₹10 chai ☕  
Plus daily interest at 100% repo rate on savings.  
No fees or minimum balance.

🎁 Offer Details:
• Sign up using referral code  
• Complete your first UPI payment  
• Get ₹250 cashback 💰

🔑 Promo Code: DSNOX46416

📋 Steps:
1️⃣ Click on "Open Offer"  
2️⃣ Install the app  
3️⃣ Sign up using same number  
4️⃣ Enter promo code  
5️⃣ Complete first UPI payment  

⚡ Reward: ₹${offer.reward}

👇 Click below to start`;
    } else {
      // 🔹 Default Offers
      message =
`🔥 ${offer.name} - Earn ₹${offer.reward}

📋 How to complete this task:

1️⃣ Click on "Open Offer"  
2️⃣ Install the app  
3️⃣ Create your account  
4️⃣ Complete required steps  

⚡ Reward: ₹${offer.reward}

👇 Click below to start`;
    }

    bot.sendMessage(id, message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Open Offer", url: offer.link }]
        ]
      }
    });
  }
});

// 💰 BALANCE
bot.onText(/💰 Balance/, (msg) => {
  const id = msg.from.id;

  bot.sendMessage(id,
    `💰 Balance: ₹${users[id].balance}\n👥 Referrals: ${users[id].refs}`,
    mainMenu()
  );
});

// 💸 WITHDRAW
bot.onText(/💸 Withdraw/, (msg) => {
  const id = msg.from.id;

  if (users[id].balance < 300) {
    return bot.sendMessage(id, "❌ Minimum ₹300 required");
  }

  if (users[id].refs < 4) {
    return bot.sendMessage(id,
      `⚠️ Withdraw unlock karne ke liye:\n\n👉 Invite 4 friends\n\n👇 Share below`,
      {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "📤 Share Now",
              switch_inline_query:
              "🔥 Found a simple way to earn online!\n\nI completed some basic tasks and already reached ₹300.\nProcess is easy and beginner-friendly.\n\nIf you want to try, join here 👇\nhttps://t.me/YOUR_BOT_USERNAME"
            }]
          ]
        }
      }
    );
  }

  bot.sendMessage(id,
    `📤 Withdraw request received\n\n⏳ Processing...`
  );
});

// 📢 SHARE COMMAND
bot.onText(/\/share/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `🔥 Found a simple way to earn online!\n\n` +
    `I completed some basic tasks and already reached ₹300.\n` +
    `Process is easy and beginner-friendly.\n\n` +
    `If you want to try, join here 👇\n` +
    `https://t.me/${process.env.BOT_USERNAME}`
  );
});
