import React from "react";
import { Children, cloneElement, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Brain, Check, ChevronLeft, ChevronRight, Clock3, CreditCard, FileCheck2, FileQuestion, Gift, Layers3, ListChecks, Mail, MonitorSmartphone, SearchCheck, ShieldCheck, Zap } from 'lucide-react';
import { content } from './content.js';
import { comercial } from './comercial.js';

const painIcons = [Clock3, Layers3, MonitorSmartphone, Brain, FileQuestion, AlertTriangle];
const mechanismIcons = [BookOpen, SearchCheck, AlertTriangle, ListChecks];

function AtlasImage({ src, className = '', ...props }) {
  const small = className.includes('product-sheet') || className.includes('product-cover');
  const sizes = small ? '240px' : '(max-width: 560px) 76vw, 400px';
  return <img {...props} className={className} src={src.replace('.webp', '-480.webp')}
    srcSet={`${src.replace('.webp', '-480.webp')} 480w, ${src.replace('.webp', '-800.webp')} 800w`}
    sizes={sizes} decoding="async" />;
}

function CTA({ label = 'QUERO O MEU ATLAS', href = '#oferta' }) {
  return <a className="btn" href={href}>{label}<span aria-hidden="true">→</span></a>;
}

function SectionTitle({ children, lead }) {
  return <header className="section-title"><h2>{children}</h2>{lead && <p>{lead}</p>}</header>;
}

function ProductComposition({ compact = false }) {
  return <div className={`product-composition${compact ? ' product-composition--compact' : ''}`} aria-label="Composição com capa e páginas reais do Atlas">
    <AtlasImage className="product-sheet product-sheet--left" src="/assets/receita-25-confeiteira.webp" alt="Receita de pudim" loading={compact ? 'lazy' : undefined}/>
    <AtlasImage className="product-sheet product-sheet--middle" src="/assets/receita-21-confeiteira.webp" alt="Receita de brownie" loading="lazy"/>
    <AtlasImage className="product-sheet product-sheet--right" src="/assets/kit-K5-confeiteira.webp" alt="Kit caneca, café e cookies" loading={compact ? 'lazy' : undefined}/>
    <AtlasImage className="product-cover" src="/assets/capa-confeiteira.webp" alt="Capa real do Atlas Visual Doces e Sobremesas, Especial de Natal" loading={compact ? 'lazy' : undefined} fetchPriority={compact ? undefined : 'high'}/>
    <div className="phone-mockup"><AtlasImage src="/assets/receita-26-confeiteira.webp" alt="Página real de manjar em uma moldura de celular" loading="lazy"/></div>
    <div className="quantity-seal"><strong>26</strong><span>RECEITAS<br/>ILUSTRADAS</span></div>
  </div>;
}

function CollectionComposition({ pitch = false }) {
 const items = pitch ? [['kit-K5-confeiteira','Kit caneca, café e cookies'],['kit-K8-confeiteira','Kit com sobremesas e cappuccino']] : [['receita-21-confeiteira','Brownie'],['receita-25-confeiteira','Pudim'],['capa-confeiteira','Capa do Atlas'],['receita-26-confeiteira','Manjar'],['kit-K5-confeiteira','Kit para presentear']];
 return <div className={pitch ? 'atlas-pair' : 'atlas-collection'}>{items.map(([src,alt])=><AtlasImage key={src} src={`/assets/${src}.webp`} alt={alt} loading="lazy"/>)}</div>;
}

function ScrollRail({ children, label, className = '', auto = false, interval = 2800 }) {
  const ref = useRef(null);
  const [stopped, setStopped] = useState(false);
  const stoppedRef = useRef(false);
  const dragRef = useRef(null);
  const draggedRef = useRef(false);
  const pausedRef = useRef(false);
  const visibleRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const normalizeTimerRef = useRef(null);
  const items = Children.toArray(children);
  const renderedItems = auto
    ? [...items, ...items.map((child, index) => cloneElement(child, { key: `loop-${index}`, 'aria-hidden': true, inert: true }))]
    : items;

  const cycleWidth = () => {
    const rail = ref.current;
    if (!rail || rail.children.length <= items.length) return 0;
    return rail.children[items.length].offsetLeft - rail.children[0].offsetLeft;
  };

  const normalize = () => {
    const rail = ref.current;
    const width = cycleWidth();
    if (!rail || !width) return;
    if (rail.scrollLeft >= width) rail.scrollLeft -= width;
  };

  const pauseTemporarily = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => { pausedRef.current = false; }, 4200);
  };

  const scheduleNormalize = () => {
    window.clearTimeout(normalizeTimerRef.current);
    normalizeTimerRef.current = window.setTimeout(normalize, 700);
  };

  const move = direction => {
    const rail = ref.current;
    if (!rail) return;
    pauseTemporarily();
    const width = cycleWidth();
    if (direction < 0 && width && rail.scrollLeft <= 2) rail.scrollLeft = width;
    rail.scrollBy({ left: direction * rail.clientWidth * .82, behavior: 'smooth' });
    scheduleNormalize();
  };

  useEffect(() => {
    if (!auto || !ref.current) return undefined;
    const rail = ref.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { threshold: .18 });
    observer.observe(rail);
    const timer = window.setInterval(() => {
      if (reduceMotion.matches || stoppedRef.current || pausedRef.current || !visibleRef.current || document.hidden) return;
      const firstItem = rail.children[0];
      const secondItem = rail.children[1];
      const step = secondItem ? secondItem.offsetLeft - firstItem.offsetLeft : rail.clientWidth * .82;
      rail.scrollBy({ left: step, behavior: 'smooth' });
      scheduleNormalize();
    }, interval);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.clearTimeout(resumeTimerRef.current);
      window.clearTimeout(normalizeTimerRef.current);
    };
  }, [auto, interval, items.length]);

  return <div className={`rail-stage ${className}`}>
    <button type="button" className="rail-arrow rail-arrow--left" onClick={() => move(-1)} aria-label={`Ver anteriores em ${label}`}><ChevronLeft /></button>
    <div
      className={`rail${auto ? ' rail--loop' : ''}`}
      ref={ref}
      tabIndex="0"
      aria-label={label}
      onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);} }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onFocus={() => { pausedRef.current = true; }}
      onBlur={() => { pausedRef.current = false; }}
      onPointerDown={event => { pausedRef.current = true; draggedRef.current = false; if(event.pointerType === 'mouse') dragRef.current = {x:event.clientX,left:event.currentTarget.scrollLeft}; }}
      onPointerMove={event => {const drag=dragRef.current; if(!drag) return; const dx=event.clientX-drag.x; if(Math.abs(dx)>6){draggedRef.current=true;event.currentTarget.style.scrollSnapType='none';event.currentTarget.style.scrollBehavior='auto';event.currentTarget.scrollLeft=drag.left-dx;}}}
      onPointerUp={event => {dragRef.current=null;event.currentTarget.style.scrollSnapType='';event.currentTarget.style.scrollBehavior='';pauseTemporarily();}}
      onPointerLeave={event => {dragRef.current=null;event.currentTarget.style.scrollSnapType='';event.currentTarget.style.scrollBehavior='';}}
      onDragStart={event => event.preventDefault()}
      onClickCapture={event => {if(draggedRef.current){event.preventDefault();event.stopPropagation();draggedRef.current=false;}}}
      onTouchEnd={pauseTemporarily}
    >{renderedItems}</div>
    <button type="button" className="rail-arrow rail-arrow--right" onClick={() => move(1)} aria-label={`Ver próximos em ${label}`}><ChevronRight /></button>
  {auto && <button className="rail-pause" type="button" aria-pressed={stopped} onClick={() => {stoppedRef.current = !stopped; setStopped(!stopped);}}>{stopped ? 'Retomar movimento' : 'Pausar movimento'}</button>}
  </div>;
}

export default function App() {
  const [preview, setPreview] = useState(null);
  const [showDock, setShowDock] = useState(false);
  const dialogRef = useRef(null);
  useEffect(() => { if(preview) dialogRef.current?.showModal(); }, [preview]);
  useEffect(() => {
    const hero = document.querySelector('.hero');
    const offer = document.getElementById('oferta');
    const updateDock = () => {
      const box = offer.getBoundingClientRect();
      setShowDock(hero.getBoundingClientRect().bottom < 0 && !(box.top < window.innerHeight && box.bottom > 0));
    };
    window.addEventListener('scroll', updateDock, { passive: true });
    window.addEventListener('resize', updateDock);
    updateDock();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('arrived');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    document.querySelectorAll('.section-title, .bonus-card, .audience-grid article').forEach(el => observer.observe(el));
    return () => {
      window.removeEventListener('scroll', updateDock);
      window.removeEventListener('resize', updateDock);
      observer.disconnect();
    };
  }, []);
  return <>
    <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <nav className="mobile-nav" aria-label="Explore o Atlas">
      <a className="mobile-brand" href="#conteudo">ATLAS <span>VISUAL</span></a>
      <div><a href="#previas">Prévias</a><a href="#bonus">Bônus</a><a href="#oferta">Oferta</a></div>
    </nav>
    <main id="conteudo">
      <section className="hero"><div className="content content--860 hero-flow">
        <p className="hero-pill">{content.hero.badge}</p>
        <h1>{content.hero.titleBefore}<em>{content.hero.titleEmphasis}</em>{content.hero.titleAfter}</h1>
        <div className="hero-media"><ProductComposition /></div>
        <p className="hero-sub">{content.hero.subtitle.map(([text, emphasis], index) => emphasis ? <strong key={index}>{text}</strong> : <span key={index}>{text}</span>)}</p>
        <CTA label="VER O ATLAS POR DENTRO" href="#previas" />
        <ul className="hero-bullets">{content.hero.bullets.map(item => <li key={item}><Check size={20}/><span>{item}</span></li>)}</ul>
        <p className="hero-amplitude">{content.hero.amplitude}</p>
      </div></section>

      <section className="section pain"><div className="content content--880 section-flow">
        <SectionTitle>{content.pain.title}<br/>{content.pain.emphasis}</SectionTitle>
        <div className="ornament" aria-hidden="true"><span /></div>
        <div className="pain-grid">{content.pains.map((item,index)=>{const Icon=painIcons[index];return <div className="pain-chip" key={item}><Icon size={18}/><span>{item}</span></div>})}</div>
        <p className="bridge">{content.pain.bridge.map(([text, emphasis], index) => emphasis ? <strong key={index}>{text}</strong> : <span key={index}>{text}</span>)}</p>
      </div></section>

      <section className="section section--tint gallery" id="previas"><div className="content content--1180 section-flow">
        <SectionTitle lead={content.gallerySection.lead}>{content.gallerySection.title}</SectionTitle>
        <p className="gallery-hint"><MonitorSmartphone size={16} aria-hidden="true"/>Deslize para explorar. Toque para ampliar.</p>
        <ScrollRail label="Páginas reais do material" className="gallery-rail" auto interval={2400}>{content.gallery.map(([src,title])=><figure className="gallery-card" key={title}><button className="preview-open" onClick={() => setPreview({src,title})} aria-label={`Ampliar: ${title}`}><AtlasImage src={src} alt={title} loading="lazy"/></button><figcaption>{title}</figcaption></figure>)}</ScrollRail>
      </div></section>

      <section className="section mechanism"><div className="content content--1120 section-flow">
        <SectionTitle lead={content.mechanismSection.lead}>{content.mechanismSection.title}</SectionTitle><button className="mechanism-page preview-open" onClick={() => setPreview({src:"/assets/receita-25-confeiteira.webp",title:"Pudim de leite condensado"})} aria-label="Ampliar receita de pudim"><AtlasImage src="/assets/receita-25-confeiteira.webp" alt="Página inteira de pudim, com ingredientes e seis etapas ilustradas" loading="lazy"/></button>
        <div className="mechanism-grid">{content.mechanism.map(([title,text],index)=>{const Icon=mechanismIcons[index];return <article key={title}><span className="mechanism-icon"><Icon size={25}/></span><h3>{title}</h3><p>{text}</p></article>})}</div>
        <p className="mechanism-close">{content.mechanismClose}</p><CTA/>
      </div></section>

      <section className="section mid-pitch"><div className="content content--1040 mid-pitch-grid">
        <div className="mid-pitch-media mid-pitch-media--generated"><CollectionComposition pitch /></div>
        <div className="mid-pitch-copy"><h2>{content.midPitch.title}</h2><p>{content.midPitch.text}</p><CTA /></div>
      </div></section>

      <section className="section audiences"><div className="content content--1040 section-flow">
        <SectionTitle>{content.audienceSection.title}</SectionTitle>
        <div className="audience-grid">{content.audiences.map(([title,text])=><article key={title}><span><Check size={17}/></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </div></section>

      <section className="section section--tint receive"><div className="content content--1000 section-flow">
        <SectionTitle>{content.benefitsSection.title}</SectionTitle>
        <div className="receive-media receive-media--generated"><CollectionComposition /></div>
        <article className="receive-card"><p className="access-badge">26 RECEITAS + {content.bonuses.length} BÔNUS</p><h3>{content.name}</h3><p>{content.benefitsSection.summary}</p><ul>{content.benefits.map(item=><li key={item}><Check size={20}/><span>{item}</span></li>)}</ul></article>
      </div></section>

      <section className="section bonuses" id="bonus"><div className="content content--980 section-flow">
        <header className="bonus-intro"><h2>Apoios para organizar e apresentar seus doces</h2><span><Gift size={17}/>{content.bonuses.length} BÔNUS INCLUÍDOS</span></header>
        <div className="bonus-grid">{content.bonuses.map((bonus)=><article className="bonus-card" key={bonus.title}>
          <div className="bonus-card-top"><p className="bonus-num">{bonus.number}</p><div className={`bonus-art${bonus.number === 'BÔNUS 01' || bonus.number === 'BÔNUS 03' ? ' bonus-art--sheet' : ''}`}><span className="bonus-art-shadow"/><div className="bonus-book"><AtlasImage src={bonus.image} alt={`Prévia real: ${bonus.title}`} loading="lazy"/></div></div></div>
          <div className="bonus-card-body"><h3>{bonus.title}</h3><p>{bonus.text}</p><div className="bonus-gain"><Check size={18}/><span>{bonus.gain}</span></div><div className="bonus-price"><strong>INCLUÍDO</strong></div></div>
        </article>)}</div>
      </div></section>

      <section className="section offer" id="oferta"><div className="content content--720 section-flow">

        <SectionTitle>{content.offer.title}</SectionTitle>
        <div className="value-stack" aria-label="Composição do valor da oferta">
          <p>SEU PACOTE INCLUI</p><ul>{['Atlas com receitas, adaptações e kits',...content.bonuses.map(b=>b.title)].map(item=><li key={item}><span>{item}</span><Check size={18} aria-label="Incluído"/></li>)}</ul>
        </div>
        <article className="plan-card" id="checkout">
          <p className="plan-badge">26 RECEITAS + {content.bonuses.length} BÔNUS</p>
          <p className="plan-kicker">OFERTA COMPLETA</p><h3>{content.name}</h3>
          <div className="plan-mockup"><ProductComposition compact /></div>
          <ul>{content.included.map(item=><li key={item}><Check size={20}/><span>{item}</span></li>)}</ul>
          <div className="price"><small>Valor do pacote</small><strong>{comercial.price}</strong><span>{comercial.installments}</span></div>
          {comercial.checkoutUrl ? <CTA href={comercial.checkoutUrl}/> : <><button className="btn btn--pending" disabled>COMPRA AINDA INDISPONÍVEL</button><p className="checkout-pending">O link de compra será disponibilizado aqui.</p></>}
          <div className="payment-trust"><span><ShieldCheck size={18}/>Garantia de {comercial.guaranteeDays} dias</span><span><CreditCard size={18}/>Pagamento único</span><span><BookOpen size={18}/>Material digital</span></div>
        </article>
        <p className="offer-close">{content.offer.noTrick}</p>
      </div></section>

      <section className="section purchase-safety"><div className="content content--1000 safety-layout">
        <article className="guarantee-card"><ShieldCheck size={54}/><h2>Garantia de {comercial.guaranteeDays} dias</h2><p>{comercial.guarantee}</p></article>
        <div className="safety-cards"><article><CreditCard size={30}/><div><h3>Um único pagamento</h3><p>{comercial.price} pelo pacote apresentado. Sem mensalidade.</p></div></article><article><FileCheck2 size={30}/><div><h3>Confira antes de decidir</h3><p>As prévias mostram páginas do próprio Atlas e dos materiais de apoio.</p></div></article></div>
      </div></section>

      <section className="section faq"><div className="content content--780 section-flow"><SectionTitle>Perguntas Frequentes</SectionTitle><div className="faq-list">{content.faqs.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></div></section>

      <section className="closing"><div className="content content--780 closing-inner"><h2>{content.closing.title}</h2><p className="closing-lead">{content.closing.lead}</p><CTA/><small>Material digital. Pagamento único de {comercial.price}.</small></div></section>
    </main>
    {showDock && !preview && <aside className="mobile-dock" aria-label="Acesso à oferta"><div><strong>{comercial.price}</strong><span>Pagamento único</span></div><a href="#oferta">VER OFERTA <ArrowRight size={18} aria-hidden="true"/></a></aside>}
    <footer className="footer"><div className="footer-inner"><p className="footer-brand">{content.name}</p><p>Especial de Natal. Material digital.</p>{!comercial.company && <p>Identificação do vendedor: a definir antes da abertura das vendas.</p>}{comercial.company && <p>{comercial.company}</p>}{comercial.supportEmail && <a href={`mailto:${comercial.supportEmail}`}>Suporte: {comercial.supportEmail}</a>}{(comercial.termsUrl || comercial.privacyUrl) && <nav>{comercial.termsUrl && <a href={comercial.termsUrl}>Termos de uso</a>}{comercial.privacyUrl && <a href={comercial.privacyUrl}>Política de privacidade</a>}</nav>}</div></footer>
    <dialog ref={dialogRef} className="preview-dialog" onClose={() => setPreview(null)} onClick={event => {if(event.target === event.currentTarget) dialogRef.current.close();}}><button className="dialog-close" type="button" onClick={() => dialogRef.current.close()}>Fechar prévia ×</button>{preview && <><h2>{preview.title}</h2><img src={preview.src} alt={preview.title}/></>}</dialog>
  </>;
}


