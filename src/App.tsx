import { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

/* ─── Idiot Bot Feed ─── */

interface FeedItem {
  id: number;
  text: string;
  time: string;
  icon: string;
}

const IDIOT_EVENTS = [
  { text: "случайно сломал frontend у Uniswap на 3 часа", icon: "💥" },
  { text: "купил $SCAM на ATH и теперь hodlit", icon: "📉" },
  { text: "отправил 47 ETH на адрес контракта без receive()", icon: "🔥" },
  { text: "заругался с ChatGPT в чате и проиграл", icon: "🤖" },
  { text: 'назвал свой токен $IDIOT и он вырос на 42069%', icon: "🚀" },
  { text: "попытался провести rug pull, но забыл как работает approve()", icon: "🤡" },
  { text: "забыл seed фразу от своего основного кошелька", icon: "🧠" },
  { text: "написал смарт-контракт с infinite approve на 0x000...000", icon: "✍️" },
  { text: "попал в фишинг, хотя сам писал статью про фишинг", icon: "🎣" },
  { text: "заминтил 10000 NFT своего кота, купил только мама", icon: "🐱" },
  { text: "поставил газ лимит 0 и удивляется почему транзакция не прошла", icon: "⛽" },
  { text: "слил приватный ключ в .env файл в публичном репо", icon: "🔑" },
  { text: "купил картинку обезьяны за 50 ETH, она jpeg", icon: "🐵" },
  { text: "написал бота который торгует в минус, стабильно 100% loss", icon: "📊" },
  { text: "попытался вернуть ETH отправленный на неправильный адрес через support", icon: "📞" },
  { text: "забыл что approve != transfer и потерял 2 ETH", icon: "💸" },
  { text: 'объяснял другу что такое DeFi, сам не понимая', icon: "🎓" },
  { text: "развернул DAO для выбора обеда в офисе", icon: "🏛️" },
  { text: "использовал mainnet для тестов вместо testnet", icon: "🧪" },
  { text: "забанил себя в собственном Discord-сервере", icon: "🔨" },
  { text: "перепутал wei и ETH и отправил 0.000000000000000001", icon: "🔬" },
  { text: 'написал твит "crypto is dead" и потом купил на всё', icon: "🐦" },
  { text: "сделал multisig кошелёк и потерял 2 из 3 ключей", icon: "🔐" },
  { text: "подписал malicious tx ради бесплатного NFT", icon: "🎁" },
  { text: "пытается майнить на калькуляторе", icon: "⛏️" },
  { text: "перевёл USDT на адрес USDC контракта", icon: "🔀" },
  { text: "ждёт подтверждения транзакции уже 3 дня", icon: "⏳" },
  { text: "поставил лимитный ордер ниже текущей цены и забыл", icon: "📉" },
  { text: "написал тг-бота который отвечает только 'wen moon'", icon: "🌙" },
  { text: "случайно задеплоил контракт с selfdestruct", icon: "💣" },
];

let feedId = 0;

function randomTime(): string {
  return `${Math.floor(Math.random() * 59)}s ago`;
}

function generateFeedItem(): FeedItem {
  const ev = IDIOT_EVENTS[Math.floor(Math.random() * IDIOT_EVENTS.length)];
  feedId++;
  return { id: feedId, text: ev.text, time: randomTime(), icon: ev.icon };
}

/* ─── Helpers ─── */

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const BOT_REPLIES = [
  "Хм, подожди... я случайно удалил всё. Начни заново.",
  "Ошибка 418: я чайник. И ты тоже, раз со мной разговариваешь.",
  "Я перенаправил твой запрос в /dev/null. Жди ответа.",
  "Сделал. Шучу, я ничего не сделал. Я не умею.",
  "Я купил на твои деньги $RUG. Спасибо за доверие.",
  "Твой запрос слишком умный для меня. Попробуй тупее.",
  "Я отправил это в блокчейн. Какой? Забыл. Неважно.",
  "Processing... 🔄 Ладно, я просто сгенерировал спиннер и пошёл спать.",
  "Согласно моим данным, ты должен мне 0.5 ETH. Это точно.",
  "⚠️ Критическая ошибка: я слишком глуп для этого запроса.",
  "Я попытался помочь, но сломал ещё и то что работало.",
  "404: мозг не найден. Попробуй позже.",
];

/* ─── App ─── */

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [feed, setFeed] = useState<FeedItem[]>(() =>
    Array.from({ length: 8 }, () => generateFeedItem())
  );

  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    {
      from: "bot",
      text: "Привет. Я IDIOT Bot. Я тут чтобы делать глупости. Спрашивай что угодно, отвечу как обычно — неправильно.",
    },
  ]);
  const [input, setInput] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setFeed((prev) => [generateFeedItem(), ...prev].slice(0, 30));
    }, 3500);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [feed]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { from: "user", text: userMsg }]);
    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)];
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    }, 800 + Math.random() * 1200);
  }

  /* ─── Not connected ─── */
  if (!isConnected) {
    return (
      <main className="shell">
        <div className="card connect-card">
          <span className="tag">IDIOT BOT</span>
          <h1>Подключи кошелёк</h1>
          <p className="subtext">
            Чтобы общаться с ботом-идиотом, подключи EVM кошелёк. Без кошелька — только
            наблюдай за лентой.
          </p>
          <button className="btn connect-btn" onClick={() => connect({ connector: injected() })}>
            Подключить MetaMask
          </button>
          <FeedPanel feed={feed} feedRef={feedRef} />
        </div>
      </main>
    );
  }

  /* ─── Connected ─── */
  return (
    <main className="shell app-shell">
      <header className="topbar">
        <span className="tag tag-logo">IDIOT BOT</span>
        <div className="topbar-right">
          <span className="wallet-badge">{shortAddr(address!)}</span>
          <button className="btn disconnect-btn" onClick={() => disconnect()}>
            Отключить
          </button>
        </div>
      </header>

      <div className="app-layout">
        <section className="chat-panel">
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from === "user" ? "chat-user" : "chat-bot"}`}>
                {msg.from === "bot" && <span className="chat-avatar">🤖</span>}
                <div className="chat-bubble">{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              className="chat-input"
              placeholder="Спроси у идиота..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn send-btn" type="submit">
              →
            </button>
          </form>
        </section>

        <FeedPanel feed={feed} feedRef={feedRef} />
      </div>
    </main>
  );
}

/* ─── Feed Panel Component ─── */

function FeedPanel({
  feed,
  feedRef,
}: {
  feed: FeedItem[];
  feedRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <aside className="feed-panel">
      <h3 className="feed-title">Live — IDIOT Bot Activity</h3>
      <div className="feed-list" ref={feedRef}>
        {feed.map((item) => (
          <div key={item.id} className="feed-item">
            <span className="feed-icon">{item.icon}</span>
            <span className="feed-text">
              <strong>IDIOT Bot</strong> {item.text}
            </span>
            <span className="feed-time">{item.time}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
