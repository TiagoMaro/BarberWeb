# 💈 Sistema de Gestão e Agendamento para Barbearia

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-success?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=for-the-badge&logo=docker)
![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?style=for-the-badge&logo=javascript)

## 📖 Sobre o Projeto

Um sistema web completo desenvolvido para automatizar o agendamento de serviços e facilitar o gerenciamento interno de uma barbearia. A aplicação conecta clientes, barbeiros e a gerência em um único ambiente, garantindo eficiência no atendimento e controle financeiro em tempo real.

## ✨ Principais Funcionalidades

### 👤 Painel do Cliente
* **Autenticação Segura:** Criação de conta e login com senhas criptografadas e validação de dados.
* **Agendamento Inteligente:** Interface para escolha de serviços, profissionais e horários disponíveis.
* **Prevenção de Conflitos:** Bloqueio automático de horários já reservados ou fora do expediente comercial.

### ✂️ Painel do Barbeiro
* **Gestão de Agenda:** Visualização clara dos cortes programados para o dia.
* **Automação de Status:** Tarefas em segundo plano (Cron Jobs) que atualizam os agendamentos antigos para o status "Concluído" automaticamente.

### 📊 Painel Gerencial (Admin)
* **Dashboard Financeiro:** Cards estatísticos calculando faturamento do dia, quantidade de clientes e agendamentos em tempo real.
* **Gestão de Serviços:** Sistema de CRUD completo para adicionar, editar (via modal interativo), inativar e listar os serviços prestados e seus respectivos valores/duração.
* **Controle de Acesso:** Promoção e alteração de cargos de usuários (Cliente -> Barbeiro -> Gerente).

## 🛠️ Tecnologias Utilizadas

**Frontend:**
* HTML5, CSS3 e JavaScript (Vanilla)
* [SweetAlert2](https://sweetalert2.github.io/) para modais e alertas dinâmicos assíncronos.
* Consumo de API via `Fetch API` com injeção de tokens JWT.

**Backend:**
* **Node.js** com **Express.js** para construção da API REST.
* **MongoDB** e **Mongoose** para modelagem do banco de dados (NoSQL) com cruzamento de dados (`populate`).
* **JSON Web Token (JWT)** para segurança e proteção de rotas privadas.
* **node-cron** para automação e tarefas agendadas no servidor.

## 🔌 Mapeamento de Endpoints da API

### 🧑‍🤝‍🧑 Usuários & Autenticação
* POST /user/registrar — Cria um novo registro de usuário na plataforma.

* POST /user/login — Autentica o usuário e retorna o token JWT assinado.

* GET /user/perfil — Retorna os dados cadastrais do usuário autenticado no momento.

* PATCH /user/:id/cargo — (Restrito ao Gerente) Atualiza hierarquicamente o cargo de um usuário.

### 💇‍♂️ Serviços e Catálogo
* GET /servicos — Retorna todos os serviços ativos no sistema.

* POST /servicos — (Restrito ao Gerente) Adiciona um novo serviço.

* PUT /servicos/:id — (Restrito ao Gerente) Atualiza integralmente os dados de um serviço existente.

* PATCH /servicos/:id/inativar — (Restrito ao Gerente) Desativa temporariamente um serviço.

### 📅 Agendamentos e Dashboard
* POST /agendamentos — Cria uma nova reserva validando a integridade de horários.

* GET /agendamentos/dashboard/estatisticas — (Restrito ao Gerente) Retorna faturamento, total de clientes e agendamentos configurados no período atual.

## 🚀 Como Executar o Projeto Localmente

O ambiente foi totalmente conteinerizado utilizando Docker, dispensando a necessidade de instalar o Node.js ou o MongoDB diretamente na máquina host. O projeto foi originalmente desenvolvido e testado nativamente no Zorin OS (Linux).

### Pré-requisitos
* [Docker](https://docs.docker.com/get-started/get-docker/) e [Docker Compose](https://docs.docker.com/compose/install/) instalados na sua máquina.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/TiagoMaro/BarberWeb.git](https://github.com/TiagoMaro/BarberWeb.git)

2. **Acesse a pasta do projeto:**
    ```
    cd barbearia-api

3. **Configuração das Variáveis de Ambiente:**

    Crie um arquivo chamado .env na raiz do projeto e insira a estrutura abaixo:
    
    ```
    PORT=3000
    MONGO_URI= (Url de acesso ao seu MongoDB Atlas)
    JWT_SECRET=sua_chave_secreta_super_segura_e_longa

4. **Inicie os containers:**

    Execute o comando abaixo para construir a imagem e subir a aplicação junto com o banco de dados em segundo plano:
    ```
    docker-compose up -d --build

5. **Acesse a aplicação:**
    ```
    Abra o navegador e acesse: http://localhost:3000

6. **Para parar os serviços (quando terminar):**
    ```
    docker-compose down


### 📝 Licença MIT - Sinta-se livre para clonar, estudar, aprimorar ou utilizar este projeto como base de estudos.