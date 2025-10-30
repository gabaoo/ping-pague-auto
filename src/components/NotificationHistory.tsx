import { useState, useEffect } from 'react';

// Mock de dados para o histórico de notificações
const mockNotifications = [
  {
    id: 1,
    client: 'Empresa A',
    message: 'Sua fatura de R$ 150,00 vence em 3 dias.',
    sentAt: '2024-07-20T10:00:00Z',
    status: 'enviado',
  },
  {
    id: 2,
    client: 'Empresa B',
    message: 'Lembrete de pagamento: sua fatura de R$ 300,00 vence amanhã.',
    sentAt: '2024-07-20T11:30:00Z',
    status: 'enviado',
  },
  {
    id: 3,
    client: 'Empresa C',
    message: 'Sua fatura de R$ 50,00 está vencida.',
    sentAt: '2024-07-19T09:00:00Z',
    status: 'falhou',
  },
  // Adicione mais notificações mockadas conforme necessário
];

export default function NotificationHistory() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simula a busca de dados de uma API
    setNotifications(mockNotifications);
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Últimas Notificações Enviadas</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enviado em</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notifications.map((notification) => (
              <tr key={notification.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{notification.client}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{notification.message}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(notification.sentAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.status === 'enviado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {notification.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
