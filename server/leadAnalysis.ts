export type CoupleJourneyFocus =
  | "understand_fit"
  | "restore_dialogue"
  | "renew_connection"
  | "align_direction";

export type CoupleInterestForAnalysis = {
  fullName: string;
  partnerName?: string | null;
  contactType: "whatsapp" | "email";
  contactValue: string;
  interestStage: "know_more" | "talk_to_team";
  journeyFocus: CoupleJourneyFocus;
};

export type LeadGuidance = {
  priority: "standard" | "priority";
  declaredFocus: string;
  whatToExpect: string;
  pastoralPosture: string;
  nextStep: string;
  suggestedOpening: string;
};

const FOCUS_GUIDANCE: Record<
  CoupleJourneyFocus,
  Omit<LeadGuidance, "priority">
> = {
  understand_fit: {
    declaredFocus: "Entender se a mentoria de casais faz sentido para este momento.",
    whatToExpect:
      "A pessoa provavelmente procura clareza sobre formato, proposta, limites e próximos passos antes de assumir um compromisso.",
    pastoralPosture:
      "Acolha com leveza, explique a proposta de forma objetiva e evite pressionar por detalhes pessoais.",
    nextStep:
      "Enviar uma apresentação breve da mentoria e oferecer uma conversa inicial com a equipe.",
    suggestedOpening:
      "Olá, [nome]. Recebemos seu interesse com carinho. Podemos explicar como funciona a mentoria e entender se este é um caminho adequado para vocês?",
  },
  restore_dialogue: {
    declaredFocus: "Voltar a conversar com mais respeito e escuta no relacionamento.",
    whatToExpect:
      "A pessoa pode buscar um espaço inicial para reorganizar conversas e recuperar uma comunicação mais consciente.",
    pastoralPosture:
      "Priorize escuta, respeito e ausência de julgamentos. Não peça detalhes íntimos no primeiro contato.",
    nextStep:
      "Oferecer uma conversa inicial com a equipe para apresentar a abordagem e combinar uma forma cuidadosa de seguir.",
    suggestedOpening:
      "Olá, [nome]. Obrigada por compartilhar esse desejo de cuidar do diálogo. Estamos aqui para explicar a proposta e caminhar com respeito ao tempo de vocês.",
  },
  renew_connection: {
    declaredFocus: "Fortalecer a conexão, a presença e a parceria do casal.",
    whatToExpect:
      "A pessoa tende a desejar mais intencionalidade, proximidade e direção para a vida a dois.",
    pastoralPosture:
      "Reconheça a iniciativa de cuidado e conduza a conversa com esperança prática, sem criar promessas de resultado.",
    nextStep:
      "Apresentar a mentoria e convidar para uma conversa de alinhamento com a equipe.",
    suggestedOpening:
      "Olá, [nome]. Que bom receber esse desejo de fortalecer a caminhada a dois. Podemos contar como a mentoria funciona e conversar sobre o próximo passo?",
  },
  align_direction: {
    declaredFocus: "Alinhar expectativas, propósito e decisões da vida a dois.",
    whatToExpect:
      "A pessoa pode buscar direção para conversas sobre escolhas, rotina e projeto de vida compartilhado.",
    pastoralPosture:
      "Acolha a busca por alinhamento e apresente a mentoria como um espaço de reflexão responsável, não como substituta de suporte especializado quando necessário.",
    nextStep:
      "Explicar a proposta e oferecer uma conversa inicial para compreender a expectativa declarada.",
    suggestedOpening:
      "Olá, [nome]. Recebemos seu interesse em fortalecer o propósito a dois. Será um prazer explicar a mentoria e entender como a equipe pode acolher vocês neste momento.",
  },
};

export function analyzeCoupleInterest(
  interest: CoupleInterestForAnalysis
): LeadGuidance {
  const guidance = FOCUS_GUIDANCE[interest.journeyFocus];
  const priority =
    interest.interestStage === "talk_to_team" ? "priority" : "standard";

  return { ...guidance, priority };
}

export function getFocusLabel(focus: CoupleJourneyFocus): string {
  return FOCUS_GUIDANCE[focus].declaredFocus;
}
