<template>
    <div class="success-queue-join-page">
      <div class="main-container">
        <div class="header">
          <div class="logo-container">
            <img class="logo" src="https://via.placeholder.com/165x18" />
          </div>
        </div>
        <div class="image-container">
          <img class="main-image" src="https://via.placeholder.com/360x180" />
        </div>
        <div class="content">
          <div class="event-title-container">
            <div class="event-title">Colégio Santo Agostinho 2023</div>
            <div class="date-box">
              <div class="month">NOV</div>
              <div class="day">9</div>
            </div>
          </div>
          <div class="queue-info">
            <div class="queue-message">Olá usuário,<br/>você está na 3ª posição da fila!</div>
            <div class="queue-position">3</div>
            <div class="custom-message">{{alguma mensagem}}</div>
          </div>
          <div class="event-details">
            <div class="title">Sobre o evento</div>
            <div class="description">Junte-se a nós em breve para um evento de doação de sangue...</div>
            <div class="more-info">Ver mais</div>
          </div>
          <div class="location">
            <div class="location-title">Localização</div>
            <img class="map-image" src="https://via.placeholder.com/480x304" />
            <div class="address">
              <div class="school-name">Colégio Santo Agostinho</div>
              <div class="school-address">R. José Linhares, 88 - Leblon, Rio de Janeiro - RJ</div>
            </div>
          </div>
        </div>
        <div class="actions">
          <div class="action-button">Ação 1</div>
          <div class="secondary-button">Ação 2?</div>
        </div>
      </div>
      <p class="queue-position-footer">Sua posição atual na fila: {{ queuePosition }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRoute } from 'nuxt';
  
  definePageMeta({ layout: "no-scroll" });
  
  const route = useRoute();
  const queuePosition = ref(0);
  
  const fetchQueuePosition = async () => {
    // Substitua com a chamada real para sua API
    try {
      const response = await fetch('/api/queue/position');
      const data = await response.json();
      queuePosition.value = data.position;
    } catch (error) {
      console.error('Falha ao obter a posição na fila:', error);
    }
  };
  
  let pollInterval = null;
  onMounted(() => {
    fetchQueuePosition();
    pollInterval = setInterval(fetchQueuePosition, 5000); // Atualiza a cada 5 segundos
  });
  
  onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
  });
  </script>
  
  <style scoped>
  .main-container {
    width: 100%;
    height: 100%;
    background: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
  
  .header {
    align-self: stretch;
    height: 40px;
    padding: 0 24px;
    background: #BB0A08;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo-container {
    width: 312px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
  }
  
  .logo {
    width: 165px;
    height: 18px;
  }
  
  <style scoped>
/* Já definido: .main-container, .header, .logo-container, .logo */

.image-container {
  align-self: stretch;
  height: 180px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.main-image {
  align-self: stretch;
  height: 180px;
}

.content {
  align-self: stretch;
  flex-grow: 1;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.event-title-container {
  align-self: stretch;
  padding: 0 16px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
}

.event-title {
  flex-grow: 1;
  color: #25282B;
  font-size: 26px;
  font-family: Lato;
  font-weight: 700;
}

.date-box {
  width: 48px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #CACCCF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.month {
  text-align: center;
  color: #BB0A08;
  font-size: 12px;
  font-family: Lato;
  font-weight: 400;
  line-height: 14px;
}

.day {
  text-align: center;
  color: #BB0A08;
  font-size: 18px;
  font-family: Lato;
  font-weight: 500;
}

.queue-info {
  align-self: stretch;
  height: 266px;
  padding: 24px;
  background: #BB0A08;
  border-radius: 8px;
  border: 2px solid #CACCCF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.queue-message, .custom-message {
  align-self: stretch;
  color: white;
  font-size: 18px;
  font-family: Lato;
  font-weight: 400;
}

.queue-position {
  width: 120px;
  height: 120px;
  padding: 16px;
  background: #D87C7F;
  border-radius: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 80px;
  font-family: Lato;
  font-weight: 700;
}

.event-details {
  align-self: stretch;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  color: #25282B;
  font-size: 22px;
  font-family: Lato;
  font-weight: 600;
}

.description {
  color: #52575C;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
  line-height: 20px;
}

.more-info {
  color: #BB0A08;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
  line-height: 20px;
}

.location {
  align-self: stretch;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-title {
  color: #25282B;
  font-size: 22px;
  font-family: Lato;
  font-weight: 600;
}

.map-image {
  width: 360px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.address {
  align-self: stretch;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.school-name, .school-address {
  color: #52575C;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
  line-height: 20px;
}

.actions {
  align-self: stretch;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button, .secondary-button {
  height: 48px;
  padding: 8px 32px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-button {
  background: #E93C3C;
  color: white;
}

.secondary-button {
  background: white;
  border: 1px solid #CACCCF;
  color: #52575C;
}

.queue-position-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
}

  </style>
  