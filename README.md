# 🚀 Muhozi Ntwali Devis — Portfolio

A complete, premium personal portfolio with admin management system.

## 📁 Folder Structure

```
portfolio/
├── index.html          ← Main public portfolio (open this in browser)
├── admin/
│   └── index.html      ← Admin dashboard (manage all content)
├── assets/
│   └── profile.svg     ← Profile picture (replace with your real photo)
├── js/
│   └── data.js         ← Shared data store
└── README.md           ← This file
```

## 🔐 Admin Login

- **URL:** `admin/index.html`
- **Username:** `muhozi`
- **Password:** `admin2024`

> Change credentials anytime via Admin → Settings → Change Password

## ✅ Features

### Public Portfolio
- Dark / Light theme toggle
- Animated hero with rotating ring avatar
- All sections: Hero, About, Skills, Projects, Experience, Certs, Contact
- **Project modal** — click any project card to see full details + links
- Scroll-triggered fade-up animations
- Fully responsive (mobile-friendly)
- Live social links (LinkedIn, GitHub, Email, Phone)

### Admin Panel
- **Profile & Info** — edit your name, title, bio, contacts, stats, availability
- **Projects** — add, edit, delete, rename, set status (Planned/In Progress/Complete), add live demo links and GitHub links
- **Experience** — manage all job history with full CRUD
- **Certificates** — add certificates with verification URLs
- **Settings** — change admin credentials, reset data

## 📸 How to Add Your Real Photo

1. Get a photo of yourself (JPG or PNG, ideally square, min 400×400px)
2. Name it `profile.jpg` (or `profile.png`)
3. Place it in the `assets/` folder
4. Open `index.html` and replace:
   ```html
   <img src="assets/profile.svg" .../>
   ```
   with:
   ```html
   <img src="assets/profile.jpg" .../>
   ```
   (change in TWO places: hero section and about section)

## 🔗 Your Links

- LinkedIn: https://rw.linkedin.com/in/devis-muhozi-ntwali-17bba438b
- GitHub: https://github.com/DevisLT
- Email: muhozintwaridevis@gmail.com
- Phone: +250 784 293 730

## 📦 How to Use

1. Open `index.html` in any web browser — no server needed!
2. To edit content, go to `admin/index.html`
3. All changes are saved to your browser's localStorage automatically
4. To deploy online: upload the whole folder to GitHub Pages, Netlify, or Vercel

## 🌐 Deploy to GitHub Pages (Free)

1. Push this folder to a GitHub repository
2. Go to Settings → Pages
3. Set source to `main` branch, `/ (root)` folder
4. Your portfolio will be live at `https://yourusername.github.io/portfolio`
