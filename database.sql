--
-- PostgreSQL database dump
--

-- Dumped from database version 10.3
-- Dumped by pg_dump version 10.1

-- Started on 2018-04-12 11:53:37 EDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2483 (class 1262 OID 12558)
-- Dependencies: 2482
-- Name: postgres; Type: COMMENT; Schema: -; Owner: cmilneil
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- TOC entry 1 (class 3079 OID 12544)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2485 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 206 (class 1259 OID 16458)
-- Name: articles; Type: TABLE; Schema: public; Owner: cmilneil
--

CREATE TABLE articles (
    id integer NOT NULL,
    feed_id integer NOT NULL,
    headline text NOT NULL,
    date date NOT NULL,
    summary text,
    byline character varying(255),
    wordcount integer,
    page_number integer,
    url text NOT NULL
);


ALTER TABLE articles OWNER TO cmilneil;

--
-- TOC entry 205 (class 1259 OID 16456)
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: cmilneil
--

CREATE SEQUENCE articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE articles_id_seq OWNER TO cmilneil;

--
-- TOC entry 2486 (class 0 OID 0)
-- Dependencies: 205
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cmilneil
--

ALTER SEQUENCE articles_id_seq OWNED BY articles.id;


--
-- TOC entry 204 (class 1259 OID 16442)
-- Name: feeds; Type: TABLE; Schema: public; Owner: cmilneil
--

CREATE TABLE feeds (
    id integer NOT NULL,
    publisher_id integer,
    description text NOT NULL,
    url text NOT NULL,
    xml_headline_tag text,
    xml_subhed_tag text,
    xml_article_tag text,
    xml_permalink_tag text,
    scraper_article_tag text
);


ALTER TABLE feeds OWNER TO cmilneil;

--
-- TOC entry 203 (class 1259 OID 16440)
-- Name: feeds_id_seq; Type: SEQUENCE; Schema: public; Owner: cmilneil
--

CREATE SEQUENCE feeds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE feeds_id_seq OWNER TO cmilneil;

--
-- TOC entry 2487 (class 0 OID 0)
-- Dependencies: 203
-- Name: feeds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cmilneil
--

ALTER SEQUENCE feeds_id_seq OWNED BY feeds.id;


--
-- TOC entry 197 (class 1259 OID 16386)
-- Name: media_markets; Type: TABLE; Schema: public; Owner: cmilneil
--

CREATE TABLE media_markets (
    id integer NOT NULL,
    market_name text
);


ALTER TABLE media_markets OWNER TO cmilneil;

--
-- TOC entry 196 (class 1259 OID 16384)
-- Name: media_markets_id_seq; Type: SEQUENCE; Schema: public; Owner: cmilneil
--

CREATE SEQUENCE media_markets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE media_markets_id_seq OWNER TO cmilneil;

--
-- TOC entry 2488 (class 0 OID 0)
-- Dependencies: 196
-- Name: media_markets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cmilneil
--

ALTER SEQUENCE media_markets_id_seq OWNED BY media_markets.id;


--
-- TOC entry 208 (class 1259 OID 16476)
-- Name: place_mentions; Type: TABLE; Schema: public; Owner: cmilneil
--

CREATE TABLE place_mentions (
    id integer NOT NULL,
    article_id integer NOT NULL,
    relevance_score smallint,
    context text,
    place_id integer
);


ALTER TABLE place_mentions OWNER TO cmilneil;

--
-- TOC entry 207 (class 1259 OID 16474)
-- Name: place_mentions_id_seq; Type: SEQUENCE; Schema: public; Owner: cmilneil
--

CREATE SEQUENCE place_mentions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE place_mentions_id_seq OWNER TO cmilneil;

--
-- TOC entry 2489 (class 0 OID 0)
-- Dependencies: 207
-- Name: place_mentions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cmilneil
--

ALTER SEQUENCE place_mentions_id_seq OWNED BY place_mentions.id;


--
-- TOC entry 199 (class 1259 OID 16397)
-- Name: places; Type: TABLE; Schema: public; Owner: cmilneil
--

CREATE TABLE places (
    id integer NOT NULL,
    place_name text,
    place_aliases text,
    geocode character varying,
    not_followed_by text,
    not_preceded_by text,
    market_id integer
);


ALTER TABLE places OWNER TO cmilneil;

--
-- TOC entry 198 (class 1259 OID 16395)
-- Name: places_id_seq; Type: SEQUENCE; Schema: public; Owner: cmilneil
--

CREATE SEQUENCE places_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE places_id_seq OWNER TO cmilneil;

--
-- TOC entry 2490 (class 0 OID 0)
-- Dependencies: 198
-- Name: places_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cmilneil
--

ALTER SEQUENCE places_id_seq OWNED BY places.id;


--
-- TOC entry 202 (class 1259 OID 16426)
-- Name: publishers; Type: TABLE; Schema: public; Owner: cmilneil
--

CREATE TABLE publishers (
    id integer NOT NULL,
    publisher text,
    market_id integer
);


ALTER TABLE publishers OWNER TO cmilneil;

--
-- TOC entry 201 (class 1259 OID 16424)
-- Name: publishers_id_seq; Type: SEQUENCE; Schema: public; Owner: cmilneil
--

CREATE SEQUENCE publishers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE publishers_id_seq OWNER TO cmilneil;

--
-- TOC entry 2491 (class 0 OID 0)
-- Dependencies: 201
-- Name: publishers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cmilneil
--

ALTER SEQUENCE publishers_id_seq OWNED BY publishers.id;


--
-- TOC entry 200 (class 1259 OID 16411)
-- Name: region_relations; Type: TABLE; Schema: public; Owner: cmilneil
--

CREATE TABLE region_relations (
    subregion_id integer NOT NULL,
    parent_region_id integer NOT NULL
);


ALTER TABLE region_relations OWNER TO cmilneil;

--
-- TOC entry 2333 (class 2604 OID 16461)
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY articles ALTER COLUMN id SET DEFAULT nextval('articles_id_seq'::regclass);


--
-- TOC entry 2332 (class 2604 OID 16445)
-- Name: feeds id; Type: DEFAULT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY feeds ALTER COLUMN id SET DEFAULT nextval('feeds_id_seq'::regclass);


--
-- TOC entry 2329 (class 2604 OID 16389)
-- Name: media_markets id; Type: DEFAULT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY media_markets ALTER COLUMN id SET DEFAULT nextval('media_markets_id_seq'::regclass);


--
-- TOC entry 2334 (class 2604 OID 16479)
-- Name: place_mentions id; Type: DEFAULT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY place_mentions ALTER COLUMN id SET DEFAULT nextval('place_mentions_id_seq'::regclass);


--
-- TOC entry 2330 (class 2604 OID 16400)
-- Name: places id; Type: DEFAULT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY places ALTER COLUMN id SET DEFAULT nextval('places_id_seq'::regclass);


--
-- TOC entry 2331 (class 2604 OID 16429)
-- Name: publishers id; Type: DEFAULT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY publishers ALTER COLUMN id SET DEFAULT nextval('publishers_id_seq'::regclass);


--
-- TOC entry 2344 (class 2606 OID 16466)
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- TOC entry 2346 (class 2606 OID 16468)
-- Name: articles articles_url_key; Type: CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY articles
    ADD CONSTRAINT articles_url_key UNIQUE (url);


--
-- TOC entry 2342 (class 2606 OID 16450)
-- Name: feeds feeds_pkey; Type: CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY feeds
    ADD CONSTRAINT feeds_pkey PRIMARY KEY (id);


--
-- TOC entry 2336 (class 2606 OID 16394)
-- Name: media_markets media_markets_pkey; Type: CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY media_markets
    ADD CONSTRAINT media_markets_pkey PRIMARY KEY (id);


--
-- TOC entry 2348 (class 2606 OID 16484)
-- Name: place_mentions place_mentions_pkey; Type: CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY place_mentions
    ADD CONSTRAINT place_mentions_pkey PRIMARY KEY (id);


--
-- TOC entry 2338 (class 2606 OID 16405)
-- Name: places places_pkey; Type: CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY places
    ADD CONSTRAINT places_pkey PRIMARY KEY (id);


--
-- TOC entry 2340 (class 2606 OID 16434)
-- Name: publishers publishers_pkey; Type: CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY publishers
    ADD CONSTRAINT publishers_pkey PRIMARY KEY (id);


--
-- TOC entry 2354 (class 2606 OID 16469)
-- Name: articles articles_feed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY articles
    ADD CONSTRAINT articles_feed_id_fkey FOREIGN KEY (feed_id) REFERENCES feeds(id);


--
-- TOC entry 2353 (class 2606 OID 16451)
-- Name: feeds feeds_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY feeds
    ADD CONSTRAINT feeds_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES publishers(id);


--
-- TOC entry 2355 (class 2606 OID 16485)
-- Name: place_mentions place_mentions_article_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY place_mentions
    ADD CONSTRAINT place_mentions_article_id_fkey FOREIGN KEY (article_id) REFERENCES articles(id);


--
-- TOC entry 2356 (class 2606 OID 16490)
-- Name: place_mentions place_mentions_place_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY place_mentions
    ADD CONSTRAINT place_mentions_place_id_fkey FOREIGN KEY (place_id) REFERENCES places(id);


--
-- TOC entry 2349 (class 2606 OID 16406)
-- Name: places places_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY places
    ADD CONSTRAINT places_market_id_fkey FOREIGN KEY (market_id) REFERENCES media_markets(id);


--
-- TOC entry 2352 (class 2606 OID 16435)
-- Name: publishers publishers_market_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY publishers
    ADD CONSTRAINT publishers_market_id_fkey FOREIGN KEY (market_id) REFERENCES media_markets(id);


--
-- TOC entry 2351 (class 2606 OID 16419)
-- Name: region_relations region_relations_parent_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY region_relations
    ADD CONSTRAINT region_relations_parent_region_id_fkey FOREIGN KEY (parent_region_id) REFERENCES places(id);


--
-- TOC entry 2350 (class 2606 OID 16414)
-- Name: region_relations region_relations_subregion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cmilneil
--

ALTER TABLE ONLY region_relations
    ADD CONSTRAINT region_relations_subregion_id_fkey FOREIGN KEY (subregion_id) REFERENCES places(id);


-- Completed on 2018-04-12 11:53:37 EDT

--
-- PostgreSQL database dump complete
--

