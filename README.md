
# 🦉 Búho Rater

**Búho Rater** is a web platform created by and for students of the **University of Sonora (Unison)**. Its goal is to allow the student community to rate, review, and check professor performance anonymously, quickly, and securely.

🔗 **Official Site:** [buhorater.com](https://buhorater.com)

---

## 🚀 Features

* **🔍 Instant Search:** Find professors by name or department in real-time.
* **⭐ Rating System:** Evaluate "Quality" and "Difficulty" on a scale of 1 to 5.
* **💬 Anonymous Reviews:** Comments are protected using **FingerprintJS** (preventing spam without requiring user registration).
* **⚡ High Performance:** Images are optimized and auto-cropped in the cloud for ultra-fast loading.
* **📱 Responsive Design:** Works perfectly on mobile devices and desktops.

---

## 🛠️ Tech Stack

This project is built on a modern **Serverless** architecture to ensure high scalability and low (or zero) maintenance costs.

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JS | Vanilla JavaScript (No heavy frameworks). |
| **Database** | Supabase | PostgreSQL in the cloud for real-time data. |
| **Storage** | Cloudinary | Hosting and real-time image optimization. |
| **Security** | FingerprintJS | Unique device identification to limit voting. |
| **Hosting** | Vercel | Continuous deployment and custom domain. |

---

## 📂 Project Structure

```text
unirait26/
├── index.html        # Main page (Search engine & Professor list)
├── Perfil.html       # Individual professor profile & Review form
├── Horario.html      # Class schedule visualization
├── Politicas.html    # Privacy policy and terms of use
├── tool.py           # Python utility script
└── styles.css        # Global styles

---

## 🛡️ Security & Optimization

### Image Handling

Originally, images were loaded directly from academic servers, causing slow load times. A migration to **Cloudinary** was implemented, resulting in:

* **80% reduction** in image file size.
* Automatic Face Detection for cropping.
* Automatic **WebP** format delivery for modern browsers.

### Spam Prevention

We do not use user accounts to ensure total anonymity. Instead, we use **FingerprintJS** to generate a unique ID based on the visitor's device.

* **Limit:** Restricts users to 1 review per professor per device.

---

## ☕ Support the Project

This is a non-profit student project. Domain and maintenance costs come out of my own pocket. If this tool saved you from a bad class or helped you find the best mentor, **buy me a coffee!**

<a href="https://www.google.com/search?q=https://www.buymeacoffee.com/starcatunison">
<img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
</a>

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use the code to learn.

**Developed with 💙 by a Semiconductor Engineering student @ Unison.**

```

---

