export class Checkin {
  id: number;
  workorderId: number;   // ID da ordem de serviço
  userId: number | null; // ID do usuário que fez o check-in
  note: string;          // observação
  createdAt: Date;
}
