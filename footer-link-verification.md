# Verificação de links do rodapé

Em 05/09/2026, foram conferidos os destinos usados no rodapé. O aplicativo **SELAH** foi acessado em `https://www.selaah.com.br/home` e apresentou a página oficial de entrada. O site profissional do desenvolvedor foi acessado em `https://www.dredsonbarroso.com.br/` e apresentou a página oficial do Dr. Edson Barroso. A inspeção da landing page confirmou os endereços renderizados: `https://www.instagram.com/dredsonbarroso/`, `https://www.dredsonbarroso.com.br/` e `mailto:edson.barroso@gmail.com`.

O endereço de Instagram foi aberto e direcionou ao fluxo público do Instagram com o perfil `dredsonbarroso` como destino. O link `mailto` foi acionado sem envio de mensagem; o navegador interrompeu a navegação por não haver um aplicativo de e-mail associado no ambiente de teste, comportamento esperado para esse tipo de endereço. A inspeção do `href` confirma o destinatário correto: `edson.barroso@gmail.com`.
