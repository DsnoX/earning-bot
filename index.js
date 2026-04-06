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

// ✅ Ensure user exists
function ensureUser(id) {
  if (!users[id]) {
    users[id] = { balance: 0, refs: 0 };
  }
}

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
    reward: 70,
    link: "http://tbk.bz/jf3gjkc9"
  },
  {
    id: 3,
    name: "Upstox",
    reward: 110,
    link: "https://upstox.onelink.me/0H1s/5GCLUE"
  }
];

// 🔥 START + REFERRAL
bot.onText(/\/start(?: (.+))?/, (msg, match) => {
  const id = msg.from.id;
  const ref = match[1];

  ensureUser(id);

  if (ref && ref != id && users[ref]) {
    users[ref].refs += 1;
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

// 📄 OFFER DETAILS
bot.on("callback_query", (q) => {
  const id = q.from.id;
  const data = q.data;

  ensureUser(id);

  if (data.startsWith("offer_")) {
    const offerId = parseInt(data.split("_")[1]);
    const offer = offers.find(o => o.id === offerId);

    let message = "";

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
  ensureUser(id);

  bot.sendMessage(id,
    `💰 Balance: ₹${users[id].balance}\n👥 Referrals: ${users[id].refs}`,
    mainMenu()
  );
});

// 💸 WITHDRAW
bot.onText(/💸 Withdraw/, (msg) => {
  const id = msg.from.id;
  ensureUser(id);

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
              `🔥 Found a simple way to earn online!

I completed some basic tasks and already reached ₹300.
Process is easy and beginner-friendly.

If you want to try, join here 👇
https://t.me/${process.env.BOT_USERNAME}?start=${id}`
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
  const id = msg.from.id;

  bot.sendMessage(msg.chat.id,
    `🔥 Found a simple way to earn online!

I completed some basic tasks and already reached ₹300.
Process is easy and beginner-friendly.

If you want to try, join here 👇
https://t.me/${process.env.BOT_USERNAME}?start=${id}`
  );
});: 
