import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';

export const metadata = {
  title: 'Contato — Casa com Leo',
  description: 'Entre em contato com a Casa com Leo para encontrar seu próximo endereço na Bahia.',
};

export default function ContatoPage() {
  return (
    <>
      <Nav active="contato" />
      <main className="contact-page-main">
        <section className="contact contact-page-section">
          <div className="wrap contact-grid">
            <div>
              <span className="eyebrow-tag">✉ Seu próximo endereço</span>
              <h1 className="section-title">Vamos conversar sobre sua casa?</h1>
              <p className="contact-page-copy">
                Conte o que você procura. Eu cuido de encontrar os imóveis que fazem sentido entre Salvador e o Litoral
                Norte Baiano.
              </p>
            </div>
            <form className="contact-form" id="contact-form">
              <label htmlFor="nome">Seu nome</label>
              <input id="nome" name="nome" required placeholder="Como posso te chamar?" />
              <label htmlFor="email">Seu e-mail</label>
              <input id="email" name="email" type="email" required placeholder="voce@email.com" />
              <label htmlFor="mensagem">O que você procura?</label>
              <textarea id="mensagem" name="mensagem" required placeholder="Conte um pouco sobre o seu próximo endereço."></textarea>
              <button className="button" type="submit">
                Enviar mensagem
              </button>
              <p className="success">Obrigado. Em breve entro em contato com você.</p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
