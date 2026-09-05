/**
 * Wânia Arantes — landing page editorial de luxo luminoso.
 */
import { type FormEvent, useState } from "react";
import { AIChatBox, type Message as ChatMessage } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  HeartHandshake,
  Instagram,
  Menu,
  MessageCircleHeart,
  Play,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/apwaniaarantes/";
const CASA_ORACAO_URL = "https://casadeoracao.com.br/sobre-nos/";
const MONOGRAM_URL = "/manus-storage/wania-arantes-monogram-lumina_47acbf03.png";
const SELAAH_URL = "https://www.selaah.com.br/home";
const SELAAH_LOGO_URL = "/manus-storage/selaah-logomarca-oficial_9e1e1251.webp";
const DEVELOPER_INSTAGRAM_URL = "https://www.instagram.com/dredsonbarroso/";
const DEVELOPER_SITE_URL = "https://www.dredsonbarroso.com.br/";
const DEVELOPER_EMAIL_URL = "mailto:edson.barroso@gmail.com";

const areas = [
  ["01", "Emocional", "Para reconhecer o que você sente sem deixar que as emoções decidam tudo sozinhas."],
  ["02", "Relacionamentos", "Para interromper repetições e construir vínculos mais conscientes e verdadeiros."],
  ["03", "Família", "Para revisitar a sua história com respeito e abrir espaço para novas escolhas."],
  ["04", "Profissional", "Para posicionar seus talentos e decisões com clareza, coragem e intenção."],
  ["05", "Prosperidade", "Para cultivar uma relação mais madura com valor, recursos e responsabilidade."],
  ["06", "Propósito", "Para aproximar sua rotina da vida que você sente que foi chamada a viver."],
  ["07", "Fé", "Para acolher a espiritualidade como fonte de presença, sabedoria e direção."],
];

const steps = [
  ["01", "Nomear", "Há dores que ficam silenciosas porque você aprendeu a funcionar mesmo cansada. Aqui, elas encontram nome e escuta."],
  ["02", "Discernir", "Olhamos para padrões, crenças e escolhas com verdade — sem rótulos, culpa ou pressa."],
  ["03", "Reposicionar", "Clareza ganha forma em decisões mais coerentes com a mulher que você está se tornando."],
];

const resources = [
  {
    icon: BookOpen,
    eyebrow: "Leitura para recomeçar",
    title: "Isaías 43",
    text: "Uma leitura sobre caminho novo, esperança e atenção ao que pode florescer daqui para frente.",
    href: "https://biblia-a-mensagem.com/isaias/43",
  },
  {
    icon: BookOpen,
    eyebrow: "Identidade e presença",
    title: "Salmo 139",
    text: "Uma pausa para lembrar que a sua história é conhecida, vista e digna de cuidado.",
    href: "https://biblia-a-mensagem.com/salmos/139",
  },
  {
    icon: Play,
    eyebrow: "Mensagem da Wânia",
    title: "Viva com Propósito",
    text: "Uma reflexão pública sobre propósito, responsabilidade e uma vida menos superficial.",
    href: "https://www.youtube.com/watch?v=pw1HcFXWjO0",
  },
];

function InstagramCta({ className = "", label = "Conversar sobre a mentoria" }: { className?: string; label?: string }) {
  return (
    <a className={`primary-cta ${className}`} href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
      <span>{label}</span>
      <ArrowUpRight size={18} strokeWidth={1.7} aria-hidden="true" />
    </a>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [coupleForm, setCoupleForm] = useState({
    fullName: "",
    partnerName: "",
    contactType: "whatsapp" as "whatsapp" | "email",
    contactValue: "",
    interestStage: "know_more" as "know_more" | "talk_to_team",
    journeyFocus: "understand_fit" as "understand_fit" | "restore_dialogue" | "renew_connection" | "align_direction",
    consent: false,
  });
  const [coupleFormMessage, setCoupleFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [coupleFormErrors, setCoupleFormErrors] = useState<Record<string, string>>({});

  const assistantMutation = trpc.assistant.ask.useMutation({
    onSuccess: ({ answer }) => setMessages(current => [...current, { role: "assistant", content: answer }]),
    onError: () => setMessages(current => [
      ...current,
      {
        role: "assistant",
        content: "Não consegui concluir sua pergunta agora. Para um atendimento mais próximo, fale com a equipe pelo [Instagram da Wânia](https://www.instagram.com/apwaniaarantes/).",
      },
    ]),
  });

  const coupleInterestMutation = trpc.coupleInterest.submit.useMutation({
    onSuccess: () => {
      setCoupleFormMessage({ type: "success", text: "Recebemos seu interesse. A equipe entrará em contato pelo canal informado." });
      setCoupleForm(current => ({ ...current, fullName: "", partnerName: "", contactValue: "", consent: false }));
    },
    onError: error => setCoupleFormMessage({ type: "error", text: error.message || "Não foi possível registrar seu interesse agora. Tente novamente em alguns minutos." }),
  });

  const closeMenu = () => setMenuOpen(false);
  const openAssistant = () => {
    closeMenu();
    setAssistantOpen(true);
  };
  const askAssistant = (content: string) => {
    if (!content.trim() || assistantMutation.isPending) return;
    setMessages(current => [...current, { role: "user", content }]);
    assistantMutation.mutate({ message: content });
  };
  const submitCoupleInterest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCoupleFormMessage(null);
    const errors: Record<string, string> = {};
    if (coupleForm.fullName.trim().length < 2) errors.fullName = "Informe seu nome para continuar.";
    const contactDigits = coupleForm.contactValue.replace(/\D/g, "");
    if (coupleForm.contactType === "whatsapp" && contactDigits.length < 10) errors.contactValue = "Informe um WhatsApp válido com DDD.";
    if (coupleForm.contactType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coupleForm.contactValue)) errors.contactValue = "Informe um e-mail válido.";
    if (!coupleForm.consent) errors.consent = "Autorize o contato da equipe para enviar o interesse.";
    if (Object.keys(errors).length) {
      setCoupleFormErrors(errors);
      return;
    }
    setCoupleFormErrors({});
    coupleInterestMutation.mutate({
      fullName: coupleForm.fullName,
      partnerName: coupleForm.partnerName || undefined,
      contactType: coupleForm.contactType,
      contactValue: coupleForm.contactValue,
      interestStage: coupleForm.interestStage,
      journeyFocus: coupleForm.journeyFocus,
      consent: coupleForm.consent,
    });
  };

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#inicio" aria-label="Wânia Arantes — início" onClick={closeMenu}>
            <img src={MONOGRAM_URL} alt="Monograma Wânia Arantes" className="brand-mark" />
            <span className="brand-type"><strong>Wânia</strong><em>Arantes</em></span>
          </a>

          <nav className="desktop-nav" aria-label="Navegação principal">
            <a href="#mentoria">A jornada</a>
            <a href="#casamento">Casamento</a>
            <a href="#presenca">Fé e presença</a>
            <a href="#recursos">Recursos</a>
            <a href="#sobre">Sobre Wânia</a>
          </nav>

          <button type="button" className="header-assistant" onClick={openAssistant}>
            <Sparkles size={15} aria-hidden="true" /> Assistente de presença
          </button>
          <button type="button" className="menu-toggle" onClick={() => setMenuOpen(open => !open)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>

        <nav className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-label="Navegação móvel">
          <a href="#mentoria" onClick={closeMenu}>A jornada</a>
          <a href="#casamento" onClick={closeMenu}>Casamento</a>
          <a href="#presenca" onClick={closeMenu}>Fé e presença</a>
          <a href="#recursos" onClick={closeMenu}>Recursos</a>
          <a href="#sobre" onClick={closeMenu}>Sobre Wânia</a>
          <button type="button" onClick={openAssistant}>Falar com a assistente <Sparkles size={17} /></button>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" onClick={closeMenu}>Acessar Instagram <ArrowUpRight size={17} /></a>
        </nav>
      </header>

      <section id="inicio" className="hero-section">
        <div className="hero-sun hero-sun-one" aria-hidden="true" />
        <div className="hero-sun hero-sun-two" aria-hidden="true" />
        <div className="hero-ribbon" aria-hidden="true" />
        <div className="content-frame hero-grid">
          <div className="hero-copy reveal">
            <p className="eyebrow"><span /> Mentoria · Fé · Propósito</p>
            <p className="hero-kicker"><HeartHandshake size={15} aria-hidden="true" /> Uma conversa que começa com cuidado</p>
            <h1>Você não precisa <em>carregar tudo</em> sozinha.</h1>
            <p className="hero-lead">Talvez por fora você continue forte. Mas, por dentro, existam dores, ciclos e escolhas pedindo atenção. Há um caminho para voltar a se reconhecer — com clareza, fé e presença.</p>
            <div className="hero-actions">
              <InstagramCta label="Quero conversar sobre a mentoria" />
              <button type="button" className="subtle-cta" onClick={openAssistant}>Antes, quero perguntar <ArrowUpRight size={16} /></button>
            </div>
            <div className="hero-credentials">
              <span className="gold-line" />
              <p>Com <strong>Wânia Arantes</strong><br />Pastora, Mentora e Coach Integral Sistêmica</p>
            </div>
          </div>

          <div className="hero-visual reveal reveal-delay">
            <div className="hero-seal"><img src={MONOGRAM_URL} alt="" /><span>presença<br />que restaura</span></div>
            <div className="hero-arch"><img src="/manus-storage/1001864356_1f8df9d3.jpg" alt="Wânia Arantes em retrato de estúdio" /></div>
            <p className="hero-caption">A mulher que você é também merece ser cuidada.</p>
          </div>
        </div>
        <a className="scroll-cue" href="#acolhimento" aria-label="Conhecer a jornada"><span>conheça o caminho</span><ChevronDown size={18} /></a>
      </section>

      <section id="acolhimento" className="pain-section" aria-labelledby="pain-title">
        <div className="content-frame pain-grid">
          <p className="chapter-label">Um lugar de acolhimento <span>—</span> sem disfarces</p>
          <div className="pain-main">
            <h2 id="pain-title">Você se tornou a pessoa que sustenta tudo.<br /><em>Mas quem sustenta você?</em></h2>
            <div className="pain-copy">
              <p>Quando a vida exige demais, é comum ir se deixando para depois. Você cuida, resolve, sorri, trabalha e continua. Só que algumas feridas não desaparecem apenas porque você se acostumou a não falar delas.</p>
              <p>Esta mentoria nasce para a mulher que deseja interromper o automático e abrir, com amor e verdade, espaço para uma nova forma de viver.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="mentoria" className="mentoring-section" aria-labelledby="mentoring-title">
        <div className="content-frame mentoring-intro">
          <div className="section-heading reveal">
            <p className="eyebrow"><span /> A jornada de mentoria</p>
            <h2 id="mentoring-title">Não é sobre se tornar outra pessoa.<br /><em>É sobre voltar para si.</em></h2>
          </div>
          <p className="section-aside reveal reveal-delay">Uma jornada integral para perceber o que hoje limita a sua vida, fortalecer a sua identidade e construir escolhas alinhadas com a mulher e a história que você quer honrar.</p>
        </div>

        <div className="content-frame steps-grid">
          {steps.map(([number, title, text]) => <article className="journey-step reveal" key={number}>
            <span>{number}</span><i /><h3>{title}</h3><p>{text}</p>
          </article>)}
        </div>

        <div className="content-frame whole-woman">
          <div className="whole-woman-title"><p className="chapter-label">A mulher por inteiro</p><h3>Porque não adianta prosperar em uma área quando outra está pedindo <em>presença.</em></h3></div>
          <div className="area-list">
            {areas.map(([number, title, text]) => <article className="area-item" key={number}><span className="area-number">{number}</span><div><h4>{title}</h4><p>{text}</p></div><ArrowUpRight size={17} aria-hidden="true" /></article>)}
          </div>
        </div>
      </section>

      <section id="casamento" className="marriage-section" aria-labelledby="marriage-title">
        <div className="marriage-trace" aria-hidden="true" />
        <div className="content-frame marriage-grid">
          <div className="marriage-copy reveal">
            <p className="eyebrow"><span /> Casamento e legado</p>
            <h2>Uma história a dois não precisa ser <em>perfeita</em> para ser cuidada.</h2>
            <p className="marriage-lead">O tempo pode trazer rotina, distância e conversas adiadas. Mas o amor amadurece quando o vínculo volta a ser escolhido com presença, verdade e propósito.</p>
            <div className="marriage-principles">
              <article><b>01</b><div><h3>Presença</h3><p>Voltar a enxergar a pessoa que caminha ao seu lado, antes de apenas dividir a agenda.</p></div></article>
              <article><b>02</b><div><h3>Verdade</h3><p>Dar espaço para conversas honestas, com respeito, escuta e responsabilidade.</p></div></article>
              <article><b>03</b><div><h3>Aliança</h3><p>Construir uma casa sustentada por escolhas diárias, fé e intencionalidade.</p></div></article>
            </div>
            <a href="#interesse-casais" className="marriage-cta"><HeartHandshake size={18} /> Quero saber sobre a mentoria <ArrowUpRight size={16} /></a>
            <p className="marriage-disclaimer">Em situações de violência, ameaça ou medo, a segurança vem primeiro: procure apoio imediato de pessoas de confiança e serviços especializados.</p>
          </div>
          <div className="marriage-visual reveal reveal-delay">
            <div className="marriage-photo-frame"><img src="/manus-storage/wania-marcos-casal_88096c1d.jpg" alt="Wânia Arantes e Marcos Arantes em retrato de casal" /></div>
            <div className="marriage-caption"><img src={MONOGRAM_URL} alt="" /><span>amor que escolhe<br />permanecer presente</span></div>
          </div>
        </div>
        <div id="interesse-casais" className="content-frame couple-form-wrap reveal">
          <div className="couple-form-intro">
            <p className="eyebrow"><span /> Mentoria de casais</p>
            <h3>Talvez seja o momento de <em>voltar a conversar.</em></h3>
            <p>Deixe apenas o essencial. A equipe entrará em contato para explicar a proposta e entender se este caminho faz sentido para vocês.</p>
            <p className="couple-form-discretion"><ShieldCheck size={15} /> Não compartilhe questões íntimas ou detalhes sensíveis neste formulário.</p>
          </div>
          <form className="couple-form" onSubmit={submitCoupleInterest} noValidate>
            <div className="form-field form-field-wide"><label htmlFor="couple-name">Seu nome</label><input id="couple-name" value={coupleForm.fullName} onChange={event => { setCoupleForm(current => ({ ...current, fullName: event.target.value })); setCoupleFormErrors(current => ({ ...current, fullName: "" })); }} placeholder="Como podemos chamar você?" autoComplete="name" aria-invalid={Boolean(coupleFormErrors.fullName)} required />{coupleFormErrors.fullName && <p className="form-error">{coupleFormErrors.fullName}</p>}</div>
            <div className="form-field form-field-wide"><label htmlFor="partner-name">Nome do cônjuge ou parceiro(a) <span>opcional</span></label><input id="partner-name" value={coupleForm.partnerName} onChange={event => setCoupleForm(current => ({ ...current, partnerName: event.target.value }))} placeholder="Se desejar informar" autoComplete="off" /></div>
            <fieldset className="form-field"><legend>Como prefere receber retorno?</legend><div className="choice-row"><label><input type="radio" name="contact-type" checked={coupleForm.contactType === "whatsapp"} onChange={() => setCoupleForm(current => ({ ...current, contactType: "whatsapp", contactValue: "" }))} /> WhatsApp</label><label><input type="radio" name="contact-type" checked={coupleForm.contactType === "email"} onChange={() => setCoupleForm(current => ({ ...current, contactType: "email", contactValue: "" }))} /> E-mail</label></div></fieldset>
            <div className="form-field"><label htmlFor="contact-value">{coupleForm.contactType === "whatsapp" ? "Seu WhatsApp com DDD" : "Seu melhor e-mail"}</label><input id="contact-value" value={coupleForm.contactValue} onChange={event => { setCoupleForm(current => ({ ...current, contactValue: event.target.value })); setCoupleFormErrors(current => ({ ...current, contactValue: "" })); }} placeholder={coupleForm.contactType === "whatsapp" ? "(00) 00000-0000" : "voce@email.com"} autoComplete={coupleForm.contactType === "whatsapp" ? "tel" : "email"} inputMode={coupleForm.contactType === "whatsapp" ? "tel" : "email"} aria-invalid={Boolean(coupleFormErrors.contactValue)} required />{coupleFormErrors.contactValue && <p className="form-error">{coupleFormErrors.contactValue}</p>}</div>
            <div className="form-field form-field-wide"><label htmlFor="interest-stage">O que vocês desejam agora?</label><select id="interest-stage" value={coupleForm.interestStage} onChange={event => setCoupleForm(current => ({ ...current, interestStage: event.target.value as "know_more" | "talk_to_team" }))}><option value="know_more">Entender como funciona a mentoria de casais</option><option value="talk_to_team">Conversar com a equipe sobre o próximo passo</option></select></div>
            <div className="form-field form-field-wide"><label htmlFor="journey-focus">Qual intenção melhor representa este momento?</label><select id="journey-focus" value={coupleForm.journeyFocus} onChange={event => setCoupleForm(current => ({ ...current, journeyFocus: event.target.value as "understand_fit" | "restore_dialogue" | "renew_connection" | "align_direction" }))}><option value="understand_fit">Entender se a mentoria faz sentido para nós</option><option value="restore_dialogue">Voltar a conversar com mais respeito e escuta</option><option value="renew_connection">Fortalecer nossa conexão e parceria</option><option value="align_direction">Alinhar expectativas, propósito e decisões</option></select><p className="form-field-note">Essa escolha orienta o primeiro contato da equipe. Não compartilhe detalhes íntimos.</p></div>
            <label className="consent-field form-field-wide"><input type="checkbox" checked={coupleForm.consent} onChange={event => { setCoupleForm(current => ({ ...current, consent: event.target.checked })); setCoupleFormErrors(current => ({ ...current, consent: "" })); }} aria-invalid={Boolean(coupleFormErrors.consent)} required /><span>Autorizo a equipe da Wânia Arantes a entrar em contato exclusivamente sobre meu interesse em mentoria de casais.</span></label>
            {coupleFormErrors.consent && <p className="form-error form-field-wide">{coupleFormErrors.consent}</p>}
            <div className="form-submit-row form-field-wide"><button type="submit" disabled={coupleInterestMutation.isPending}>{coupleInterestMutation.isPending ? "Enviando interesse..." : "Enviar meu interesse"}<ArrowUpRight size={17} /></button>{coupleFormMessage && <p className={`form-feedback is-${coupleFormMessage.type}`} role="status">{coupleFormMessage.text}</p>}</div>
          </form>
        </div>
      </section>

      <section id="presenca" className="faith-section" aria-labelledby="faith-title">
        <div className="faith-orb faith-orb-one" aria-hidden="true" />
        <div className="content-frame faith-grid">
          <div className="faith-image reveal"><img src="/manus-storage/1001864354_d9f6924d.jpg" alt="Wânia Arantes em retrato elegante" /><div className="faith-image-caption"><img src={MONOGRAM_URL} alt="" /><span>fé que ampara<br />verdade que move</span></div></div>
          <div className="faith-copy reveal reveal-delay">
            <p className="eyebrow"><span /> Pastoreio e propósito</p>
            <h2 id="faith-title">A fé não silencia a dor.<br /><em>Ela ajuda a atravessá-la.</em></h2>
            <p>Como pastora e mentora, Wânia acredita em uma caminhada que acolhe a sua dimensão espiritual com respeito, responsabilidade e amor. Aqui, fé não é uma cobrança para parecer forte — é espaço de presença, sabedoria e reencontro.</p>
            <p className="faith-quote">“Há coisas que mudam quando você deixa de caminhar sozinha.”</p>
            <div className="faith-actions"><button type="button" onClick={openAssistant}><MessageCircleHeart size={18} /> Fazer uma pergunta de fé</button><a href={CASA_ORACAO_URL} target="_blank" rel="noreferrer">Conhecer a Casa de Oração <ArrowUpRight size={16} /></a></div>
          </div>
        </div>
      </section>

      <section id="recursos" className="resources-section" aria-labelledby="resources-title">
        <div className="content-frame resource-heading">
          <div><p className="eyebrow"><span /> Para continuar perto</p><h2 id="resources-title">Direção para os dias em que<br /><em>você precisa respirar.</em></h2></div>
          <p>Recursos públicos para apoiar uma pausa de fé e reflexão. Eles não substituem conversa pastoral, terapia ou atendimento profissional quando necessário.</p>
        </div>
        <div className="content-frame resource-grid">
          {resources.map(({ icon: Icon, eyebrow, title, text, href }) => <a className="resource-card reveal" href={href} target="_blank" rel="noreferrer" key={title}>
            <Icon size={22} strokeWidth={1.5} aria-hidden="true" /><p>{eyebrow}</p><h3>{title}</h3><span>{text}</span><b>Ver recurso <ArrowUpRight size={15} /></b>
          </a>)}
        </div>
      </section>

      <section className="assistant-section" aria-labelledby="assistant-section-title">
        <div className="content-frame assistant-layout">
          <div className="assistant-copy reveal"><p className="eyebrow"><span /> Assistente de presença</p><h2 id="assistant-section-title">Talvez a sua primeira decisão seja<br /><em>simplesmente perguntar.</em></h2><p>Uma conversa inicial para quem quer entender a mentoria, buscar uma oração breve, refletir sobre vínculos, encontrar um versículo para recomeçar ou conhecer mensagens e canais oficiais da Casa de Oração.</p><button className="light-cta" type="button" onClick={openAssistant}>Abrir a assistente <Sparkles size={18} /></button></div>
          <div className="assistant-preview reveal reveal-delay">
            <div className="assistant-preview-top"><span className="assistant-avatar"><img src={MONOGRAM_URL} alt="" /></span><div><small>Assistente de Presença</small><strong>Online para orientar</strong></div><i /></div>
            <p className="assistant-message">“Por onde você gostaria de começar hoje?”</p>
            <div className="assistant-suggestions">
              {["Quero entender a mentoria", "Pode fazer uma oração breve?", "Como a fé pode apoiar o casamento?", "Indique uma mensagem da Wânia"].map(question => <button type="button" key={question} onClick={() => { openAssistant(); askAssistant(question); }}>{question}<ArrowUpRight size={15} /></button>)}
            </div>
            <p className="assistant-note"><ShieldCheck size={14} /> Informações gerais e acolhimento inicial, sem substituir atendimento humano.</p>
          </div>
        </div>
      </section>

      <section id="sobre" className="about-section" aria-labelledby="about-title">
        <div className="content-frame about-grid">
          <div className="about-copy reveal"><p className="eyebrow"><span /> Quem conduz esta jornada</p><h2 id="about-title">Wânia<br /><em>Arantes.</em></h2><p>Mentora, Coach Integral Sistêmica formada pela Febracis, Pastora e fundadora da Casa de Oração Franca. Sua missão é acompanhar mulheres que desejam romper ciclos, restaurar a identidade e se posicionar para construir a vida que desejam viver.</p><p>Seu olhar une firmeza e acolhimento: cada mulher traz uma história que merece ser tratada com respeito, escuta e responsabilidade.</p><div className="credential-line"><Check size={16} /> Formação em Coaching Integral Sistêmico — Febracis</div></div>
          <div className="about-visual reveal reveal-delay"><div className="about-frame"><img src="/manus-storage/1001864353_52e10183.jpg" alt="Wânia Arantes em retrato de estúdio" /></div><div className="about-emblem"><img src={MONOGRAM_URL} alt="" /><span>amor, verdade<br />e direção</span></div></div>
        </div>
      </section>

      <section id="contato" className="final-section" aria-labelledby="final-title">
        <div className="final-rings" aria-hidden="true" />
        <div className="content-frame final-content reveal">
          <img src={MONOGRAM_URL} alt="" className="final-monogram" />
          <p className="chapter-label">O seu próximo capítulo <span>—</span> pode começar aqui</p>
          <h2 id="final-title">Você não precisa esperar a vida mudar para começar a <em>se escolher.</em></h2>
          <p>Há uma mulher dentro de você que não precisa ser inventada — apenas reencontrada. Se algo nesta conversa tocou você, talvez seja o momento de dar um próximo passo com presença.</p>
          <InstagramCta className="final-cta" label="Iniciar uma conversa" />
          <a className="instagram-handle" href={INSTAGRAM_URL} target="_blank" rel="noreferrer"><Instagram size={16} /> @apwaniaarantes</a>
        </div>
      </section>

      <footer className="site-footer"><div className="content-frame footer-inner"><a href="#inicio" className="footer-brand"><img src={MONOGRAM_URL} alt="" /><span>Wânia Arantes</span></a><section className="footer-selaah" aria-label="Aplicativo Selaah"><a href={SELAAH_URL} target="_blank" rel="noreferrer"><img src={SELAAH_LOGO_URL} alt="Logomarca do aplicativo Selaah" /><span><small>Aplicativo de fé</small><strong>SELAH</strong></span><ArrowUpRight size={14} aria-hidden="true" /></a><p>Uma pausa para orar e crescer com presença.</p></section><section className="footer-developer" aria-label="Créditos de desenvolvimento"><p>Desenvolvido por <strong>Dr. Edson Barroso</strong></p><div><a href={DEVELOPER_INSTAGRAM_URL} target="_blank" rel="noreferrer">@dredsonbarroso</a><a href={DEVELOPER_SITE_URL} target="_blank" rel="noreferrer">www.dredsonbarroso.com.br</a><a href={DEVELOPER_EMAIL_URL}>edson.barroso@gmail.com</a></div></section><a className="footer-instagram" href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram da Wânia Arantes"><Instagram size={18} /></a></div><div className="content-frame footer-copyright"><span>© {new Date().getFullYear()} Wânia Arantes. Todos os direitos reservados.</span><span>Mentoria, fé e propósito para mulheres.</span></div></footer>

      <button type="button" className="assistant-fab" aria-label="Abrir assistente de presença" onClick={openAssistant}><Sparkles size={19} /><span>Fale com a assistente</span></button>

      {assistantOpen && <div className="assistant-layer" role="dialog" aria-modal="true" aria-labelledby="assistant-title"><button className="assistant-backdrop" type="button" aria-label="Fechar assistente" onClick={() => setAssistantOpen(false)} /><section className="assistant-panel"><header className="assistant-header"><div><p className="eyebrow"><span /> Presença digital</p><h2 id="assistant-title">Uma conversa<br /><em>com cuidado.</em></h2></div><button type="button" className="assistant-close" onClick={() => setAssistantOpen(false)} aria-label="Fechar assistente"><X size={20} /></button></header><p className="assistant-intro">Posso orientar sobre a mentoria, sugerir uma leitura bíblica ou vídeo público, fazer uma oração breve e compartilhar reflexões gerais sobre casamento e vínculos. Escolha uma pergunta ou escreva a sua.</p><AIChatBox messages={messages} onSendMessage={askAssistant} isLoading={assistantMutation.isPending} className="pastoral-chat" height="min(51vh, 455px)" placeholder="Escreva a sua pergunta..." emptyStateMessage="Estou aqui para começar uma conversa com presença." suggestedPrompts={["Como a mentoria pode me ajudar?", "Você pode fazer uma oração breve?", "Como a fé pode apoiar o casamento?", "Qual versículo ler para recomeçar?", "Indique uma mensagem da Wânia", "Como conhecer a Casa de Oração?"]} /><p className="assistant-privacy">Evite compartilhar dados pessoais, informações de saúde ou situações urgentes. Para apoio individual, converse diretamente com a equipe.</p></section></div>}
    </main>
  );
}
