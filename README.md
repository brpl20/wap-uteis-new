# WhtasApp Uteis
Este repositório é um conjunto de ferramentas para WhatsAppWeb usando a biblioteca do [Pedro Lopez](https://github.com/pedroslopez/whatsapp-web.js/) pré fabricadas para facilitar a rotina _e que a rotina já faz parte de você, que tem ideias tão modernas e é o mesmo homem, que vivia nas cavernas._

# Banco de Dados
Usamos um banco de dados não sql em mongoDB que pode ser utilizado localmente ou gratuitamente na nuvem para pequenos projetos - mongoDB atlas. 

# Autenticador por Telegram
Configure seu bot de Telegram com o botfather e o seu qr code será enviado para o seu chat através do seu bot, isso possibilita uma configuração fácil para quem não tem acesso ao servidor em que o WhatsAppWeb está rodando. Claro que você irá precisar abrir o Telegram em um computador para ler o qr code do seu celular mas é melhor do que fazer um ssh no servidor. i

# Bots
Temos basicamente dois bots, um escutando as suas mensagens criadas e outro escutando as mensagens recebidas. O primeiro é o `botOnMessageCreate` e o segundo é o `botOnMessage`. 

# Arquivador Soft e Hard
No `botOnMessageCreate` ele poderá arquivar de modo `soft` neste modo você simplesmente arquiva os chats, como por exemplo aquele grupo chato mas do qual você não pode sair, ou daquele contato que manda SPAM mas você não pode bloquear.

No modo hard ele irá sair do grupo ou realmente bloquear a pessoa, portanto cuidado.

# Discos
A ser implementado. 

# Vault
A ser implementado.

# Transcrevedor
A ser implementado. Transcreve a mensagem depois de 3 minutos idle, uma vez que muito provavelmente você estará em reunião ou algo do tipo. 

# Lembrete em...
A ser implementado. Cria um lembrete que aparecerá no chat depois de X dias. 


## TD
- Criar método de desbloqueio -> Primeiro é preciso listar os bloqueios e comparar com o banco de dados 
