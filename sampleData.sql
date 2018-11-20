--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3
-- Dumped by pg_dump version 10.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: media_markets; Type: TABLE DATA; Schema: public; Owner: cmilneil
--

COPY public.media_markets (id, market_name) FROM stdin;
1	New York metropolitan region
\.


--
-- Data for Name: publishers; Type: TABLE DATA; Schema: public; Owner: cmilneil
--

COPY public.publishers (id, publisher, market_id) FROM stdin;
1	New York Daily News	1
2	New York Post	1
\.

--
-- Data for Name: places; Type: TABLE DATA; Schema: public; Owner: cmilneil
--


COPY public.places (id, place_name, market_id) FROM stdin;
1	Brooklyn	1
2	Staten Island	1
\.


--
-- Data for Name: feeds; Type: TABLE DATA; Schema: public; Owner: cmilneil
--

COPY public.feeds (id, publisher_id, description, url, xml_headline_tag, xml_subhed_tag, xml_article_tag, xml_permalink_tag, scraper_article_tag) FROM stdin;
1	1	New York Daily News Local section	http://www.nydailynews.com/cmlink/NYDN.Local.rss	title	description	\N	link	article>p
2	2	NY Post Metro section	https://nypost.com/metro/feed/	title	description	\N	link	div.entry-content>p
\.


--
-- Data for Name: region_relations; Type: TABLE DATA; Schema: public; Owner: cmilneil
--

COPY public.region_relations (subregion_id, parent_region_id) FROM stdin;
\.


--
-- Name: feeds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cmilneil
--

SELECT pg_catalog.setval('public.feeds_id_seq', 3, true);


--
-- Name: media_markets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cmilneil
--

SELECT pg_catalog.setval('public.media_markets_id_seq', 2, true);


--
-- Name: publishers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cmilneil
--

SELECT pg_catalog.setval('public.publishers_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

