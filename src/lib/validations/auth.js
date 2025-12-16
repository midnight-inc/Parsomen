import { z } from 'zod';

// Login Schema (supports email or username)
export const loginSchema = z.object({
    identifier: z
        .string()
        .min(1, 'E-posta veya kullanıcı adı gerekli')
        .min(3, 'En az 3 karakter girin'),
    password: z
        .string()
        .min(1, 'Şifre gerekli')
        .min(6, 'Şifre en az 6 karakter olmalı')
});

// Register Schema
export const registerSchema = z.object({
    username: z
        .string()
        .min(1, 'Kullanıcı adı gerekli')
        .min(3, 'Kullanıcı adı en az 3 karakter olmalı')
        .max(20, 'Kullanıcı adı en fazla 20 karakter olmalı')
        .regex(/^[a-zA-Z0-9_]+$/, 'Sadece harf, rakam ve alt çizgi kullanılabilir'),
    email: z
        .string()
        .min(1, 'E-posta gerekli')
        .email('Geçerli bir e-posta adresi girin'),
    password: z
        .string()
        .min(1, 'Şifre gerekli')
        .min(6, 'Şifre en az 6 karakter olmalı')
        .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
        .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
    confirmPassword: z
        .string()
        .min(1, 'Şifre tekrarı gerekli')
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword']
});
