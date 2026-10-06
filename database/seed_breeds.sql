--
-- PostgreSQL database dump
--

\restrict UprYOJgTtYJqUSlhPGxtGNny23wQRqedDDX5Mt4gYhNpe4BaY4MVmbWmvb4DvYc

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: breeds; Type: TABLE DATA; Schema: public; Owner: nutripet_app
--

INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (1, 'Gato', 'Abisinio', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (2, 'Gato', 'American Shorthair', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (3, 'Gato', 'Angora Turco', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (4, 'Gato', 'Azul Ruso', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (6, 'Gato', 'Birmano', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (7, 'Gato', 'Bombay', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (8, 'Gato', 'Bosque de Noruega', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (9, 'Gato', 'British Shorthair', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (11, 'Gato', 'Cornish Rex', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (12, 'Gato', 'Devon Rex', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (14, 'Gato', 'Himalayo', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (15, 'Gato', 'Maine Coon', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (16, 'Gato', 'Manx', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (17, 'Gato', 'Munchkin', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (18, 'Gato', 'Oriental de Pelo Corto', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (19, 'Gato', 'Persa', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (20, 'Gato', 'Ragdoll', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (21, 'Gato', 'Savannah', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (22, 'Gato', 'Scottish Fold', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (24, 'Gato', 'Siberiano', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (25, 'Gato', 'Sphynx', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (26, 'Gato', 'Mestizo / Sin raza definida', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (28, 'Perro', 'Akita', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (29, 'Perro', 'Alaskan Malamute', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (30, 'Perro', 'American Staffordshire Terrier', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (31, 'Perro', 'Australian Shepherd', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (32, 'Perro', 'Beagle', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (34, 'Perro', 'Border Collie', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (35, 'Perro', 'Boston Terrier', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (36, 'Perro', 'Boxer', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (39, 'Perro', 'Bull Terrier', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (40, 'Perro', 'Cane Corso', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (41, 'Perro', 'Chihuahua', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (42, 'Perro', 'Chow Chow', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (43, 'Perro', 'Cocker Spaniel', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (44, 'Perro', 'Dachshund', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (46, 'Perro', 'Doberman', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (47, 'Perro', 'Fox Terrier', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (48, 'Perro', 'Golden Retriever', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (50, 'Perro', 'Husky Siberiano', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (51, 'Perro', 'Jack Russell Terrier', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (52, 'Perro', 'Labrador Retriever', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (55, 'Perro', 'Pastor Belga', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (57, 'Perro', 'Pinscher Miniatura', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (58, 'Perro', 'Pitbull', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (59, 'Perro', 'Pomerania', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (60, 'Perro', 'Poodle', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (61, 'Perro', 'Pug', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (62, 'Perro', 'Rottweiler', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (63, 'Perro', 'Samoyedo', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (64, 'Perro', 'San Bernardo', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (65, 'Perro', 'Schnauzer', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (66, 'Perro', 'Shih Tzu', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (67, 'Perro', 'West Highland White Terrier', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (68, 'Perro', 'Yorkshire Terrier', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (69, 'Perro', 'Mestizo / Sin raza definida', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (71, 'Gato', 'Otra raza / No aparece en la lista', true, '2026-10-01 11:44:30.254219');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (72, 'Perro', 'Otra raza / No aparece en la lista', true, '2026-10-01 11:44:30.254219');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (5, 'Gato', 'Bengalí', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (10, 'Gato', 'Burmés', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (13, 'Gato', 'Exótico de Pelo Corto', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (23, 'Gato', 'Siamés', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (27, 'Gato', 'No sé la raza', true, '2026-10-01 11:40:37.238619');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (33, 'Perro', 'Bichón Frisé', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (37, 'Perro', 'Bulldog Francés', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (38, 'Perro', 'Bulldog Inglés', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (45, 'Perro', 'Dálmata', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (49, 'Perro', 'Gran Danés', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (53, 'Perro', 'Maltés', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (54, 'Perro', 'Pastor Alemán', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (56, 'Perro', 'Pekinés', true, '2026-10-01 11:40:46.656504');
INSERT INTO public.breeds (id, species, name, active, created_at) VALUES (70, 'Perro', 'No sé la raza', true, '2026-10-01 11:40:46.656504');


--
-- Name: breeds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: nutripet_app
--

SELECT pg_catalog.setval('public.breeds_id_seq', 72, true);


--
-- PostgreSQL database dump complete
--

\unrestrict UprYOJgTtYJqUSlhPGxtGNny23wQRqedDDX5Mt4gYhNpe4BaY4MVmbWmvb4DvYc

