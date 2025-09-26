# Gunakan image Node.js
FROM node:18

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua source code
COPY . .

# Build Next.js
RUN npm run build

# Expose port 7012 (bukan 3000 lagi)
EXPOSE 7009

# Jalankan aplikasi
CMD ["npm", "start"]
