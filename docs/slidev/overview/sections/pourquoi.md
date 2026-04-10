# Pourquoi l'observabilité ?

---

# Le problème

<v-clicks>

- Les architectures modernes sont **distribuées** (microservices, conteneurs, cloud)
- Une requête traverse **plusieurs services** avant d'obtenir une réponse
- Les logs seuls ne suffisent plus : **où est le problème ?**
- Les métriques système (CPU, RAM) ne racontent pas toute l'histoire

</v-clicks>

<!--
Dans un monolithe, un stack trace suffisait. Dans un système distribué, il faut corréler les événements entre services.
-->

---
layout: two-cols
---

# Sans observabilité

<v-clicks>

- 😰 "Le service est lent, mais lequel ?"
- 🔍 Recherche manuelle dans les logs
- 📉 Pas de corrélation entre signaux
- ⏱️ MTTR élevé (heures → jours)

</v-clicks>

::right::

# Avec observabilité

<v-clicks>

- ✅ Vue bout-en-bout d'une requête
- 🔗 Corrélation traces / métriques / logs
- 📊 Dashboards temps réel
- ⚡ MTTR réduit (minutes → heures)

</v-clicks>
