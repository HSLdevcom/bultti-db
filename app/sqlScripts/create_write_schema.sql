create schema if not exists :schema:;
alter schema :schema: owner to postgres;

create table :schema:.ak_aikataulukausi
(
    aktunnus varchar not null
        constraint ak_aikataulukausi_pkey
            primary key,
    akalkpvm date,
    akpaattpvm date,
    kausi numeric,
    aikajakso varchar,
    kommentti varchar,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone
);

alter table :schema:.ak_aikataulukausi owner to postgres;

create table :schema:.ak_kaavio
(
    aktunnus varchar,
    kaatunnus varchar,
    kaavoimast date,
    pvtyyppi varchar,
    kaaversio numeric,
    kaaid numeric not null
        constraint ak_kaavio_pkey
            primary key,
    kaaviimvoi date,
    kaanimi varchar,
    tyyppi numeric,
    aikataulupala numeric,
    kohtunnus varchar,
    kuormaika numeric,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone,
    haspvtyyppi varchar
);

alter table :schema:.ak_kaavio owner to postgres;

create index ak_kaavio_kaaid_index
    on :schema:.ak_kaavio (kaaid);

create index ak_kaavio_kaatunnus_index
    on :schema:.ak_kaavio (kaatunnus);

create index ak_kaavio_kaatunnus_kaaversio_index
    on :schema:.ak_kaavio (kaatunnus, kaaversio);

create index ak_kaavio_kaaversio_index
    on :schema:.ak_kaavio (kaaversio);

create index ak_kaavio_kohtunnus_index
    on :schema:.ak_kaavio (kohtunnus);

create index ak_kaavio_pvtyyppi_index
    on :schema:.ak_kaavio (pvtyyppi);

create index ak_kaavio_kaavoimast_index
    on :schema:.ak_kaavio (kaavoimast);

create index ak_kaavio_kaaviimvoi_index
    on :schema:.ak_kaavio (kaaviimvoi);

create index ak_kaavio_validity_period_index
    on :schema:.ak_kaavio (kaavoimast, kaaviimvoi);

create table :schema:.ak_kaavion_lahto
(
    kaaid numeric not null,
    reitunnus varchar not null,
    suunta numeric not null,
    lahaika varchar not null,
    ajoaika numeric,
    kaltyyppi varchar,
    ajotyyppi numeric,
    srtunnus varchar,
    autonumero numeric,
    kommentti text,
    voimok varchar,
    vrkvht varchar,
    viitem varchar,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone,
    termaika numeric,
    elpymisaika numeric,
    pakollkaltyyppi boolean,
    liitunnus numeric,
    saapaika varchar,
    constraint ak_kaavion_lahto_pk
        primary key (kaaid, reitunnus, suunta, lahaika)
);

alter table :schema:.ak_kaavion_lahto owner to postgres;

create index reitunnus
    on :schema:.ak_kaavion_lahto (reitunnus);

create index kaaid
    on :schema:.ak_kaavion_lahto (kaaid);

create index suunta
    on :schema:.ak_kaavion_lahto (suunta);

create index kaltyyppi
    on :schema:.ak_kaavion_lahto (kaltyyppi);

create index liitunnus
    on :schema:.ak_kaavion_lahto (liitunnus);

create index lahto_lahtoaika
    on :schema:.ak_kaavion_lahto (lahaika);

create table :schema:.jr_ajoneuvo
(
    id varchar,
    status varchar,
    liitunnus varchar not null,
    varikko varchar,
    reknro varchar not null,
    kylkinro varchar not null,
    kaltyyppi varchar,
    kalluokka numeric,
    lattiakorkeus numeric,
    alkutark boolean,
    tarkpvm timestamp with time zone,
    kohtunnus1 varchar,
    kohtunnus2 varchar,
    ulkoilme numeric,
    alustavalmist numeric,
    alustamalli varchar,
    korivalmist numeric,
    korimalli varchar,
    pituus numeric,
    korkeus numeric,
    polttoaine varchar,
    hybridi numeric,
    oviratkaisu varchar,
    rekpvm date,
    kayttpvm date,
    voimast date,
    viimvoi date,
    istumapaikat numeric,
    kaantoistuimet numeric,
    lvaunupaikat numeric,
    paastoluokka numeric,
    noxpaastot numeric,
    pmpaastot numeric,
    co2paastot numeric,
    sisamelu numeric,
    ulkomelu numeric,
    matkilmast numeric,
    kuljilmast numeric,
    matklasklaite boolean,
    laukkuteline boolean,
    helmilaite boolean,
    tallkamera boolean,
    turvaohjaamo boolean,
    palsamjarj boolean,
    kulutusseuranta boolean,
    alkolukko boolean,
    ovikamera boolean,
    lisalammitin boolean,
    teholammitin boolean,
    startstop boolean,
    pakokaasupuhd boolean,
    peruutuskamera boolean,
    ajonvakautus boolean,
    turvateli boolean,
    niiaustoiminto boolean,
    pistoke boolean,
    valoetunro numeric,
    varuste1 varchar,
    varuste2 varchar,
    varuste3 varchar,
    varuste4 boolean,
    varuste5 boolean,
    varuste6 numeric,
    seliteyht varchar,
    selitehsl varchar,
    tallentaja varchar,
    tallpvm timestamp with time zone,
    ajoneuvoid numeric,
    ilmentymanjnro numeric,
    vartunnus numeric,
    kontunnus numeric,
    lijlaitteet boolean,
    yliikaisyys numeric,
    constraint jr_ajoneuvo_pk
        primary key (reknro, kylkinro, liitunnus)
);

alter table :schema:.jr_ajoneuvo owner to postgres;

create index ajoneuvo_reknro
    on :schema:.jr_ajoneuvo (reknro);

create index ajoneuvo_kylkinro
    on :schema:.jr_ajoneuvo (kylkinro);

create index ajoneuvo_rekpvm
    on :schema:.jr_ajoneuvo (rekpvm);

create table :schema:.jr_eritpvkalent
(
    eritpoikpvm date not null,
    eritpaiva varchar not null,
    eritviikpaiva varchar,
    eriteimuita boolean,
    eritkuka varchar,
    eritviimpvm timestamp with time zone,
    eritjunat boolean,
    constraint jr_eritpvkalent_pkey
        primary key (eritpoikpvm, eritpaiva)
);

alter table :schema:.jr_eritpvkalent owner to postgres;

create table :schema:.jr_kilpailukohd
(
    kohtunnus varchar not null
        constraint jr_kilpailukohd_pk
            primary key,
    kohtilorg varchar,
    kohalkpvm date,
    kohpaattpvm date,
    liikaloituspvm date,
    muuttunut numeric,
    muutospvm date,
    kohnimi varchar,
    liitunnus numeric,
    kohtarjouspvm date,
    kohindeksipvm date,
    prosentti numeric,
    prosentti2 numeric,
    valtyyppi numeric,
    kmhinta numeric,
    tuntihinta numeric,
    pvhinta numeric,
    promraja numeric,
    ajamkerr1 numeric,
    ajamkerr2 numeric,
    ylimkerr numeric,
    kohkuka varchar,
    kohviimpvm date,
    tilnro varchar,
    ilmoitus1 numeric,
    ilmoitus2 boolean,
    selite varchar,
    perehdytys numeric,
    koulutus numeric,
    helmi numeric,
    sopimusno varchar,
    sloppupvm date,
    optiomahd numeric,
    optiokayt numeric,
    lisatietoa varchar,
    tyyppi numeric,
    sopimustyyppi varchar,
    kyssanktio1 numeric,
    kyssanktio2 numeric,
    kyssanktio3 numeric,
    seuranta numeric,
    tavoitetaso numeric,
    vertailutaso_alku numeric,
    vertailutaso_loppu numeric,
    vertailukerroin numeric,
    louhinkoodi numeric
);

alter table :schema:.jr_kilpailukohd owner to postgres;

create index kohtunnus
    on :schema:.jr_kilpailukohd (kohtunnus);

create index seuranta
    on :schema:.jr_kilpailukohd (seuranta);

create index kohtunnus_seuranta_not_null
    on :schema:.jr_kilpailukohd (kohtunnus)
    where (seuranta IS NOT NULL);

create index kohde_liitunnus
    on :schema:.jr_kilpailukohd (liitunnus);

create table :schema:.jr_konserni
(
    kontunnus numeric not null
        constraint jr_konserni_pkey
            primary key,
    konlyhenne varchar,
    konnimi varchar,
    tallpvm timestamp with time zone,
    tallentaja varchar,
    ytunnus varchar,
    status numeric
);

alter table :schema:.jr_konserni owner to postgres;

create table :schema:.jr_koodisto
(
    koolista varchar not null,
    koojarjestys numeric,
    kookoodi varchar not null,
    kooselite varchar,
    koonumero numeric,
    tyyppinumero1 numeric,
    tyyppinimi1 varchar,
    tyyppinimi2 varchar,
    koodityyppi varchar,
    constraint jr_koodisto_pk
        primary key (kookoodi, koolista)
);

alter table :schema:.jr_koodisto owner to postgres;

create table :schema:.jr_liikennoitsija
(
    liitunnus numeric not null
        constraint jr_liikennoitsija_pk
            primary key,
    liinimi varchar,
    liinimir varchar,
    liinimilyh varchar,
    liinimilyhr boolean,
    liiosoite varchar,
    liiposti varchar,
    liitoimittnro numeric,
    liivastapuoli numeric,
    liiptilinro varchar,
    liiytunnus varchar,
    liipankki varchar,
    liikuka varchar,
    liiviimpvm date,
    kontunnus numeric,
    liityyppi numeric,
    status numeric,
    postinumero numeric,
    postitoimipaikka varchar,
    lijliikennoitsija boolean
);

alter table :schema:.jr_liikennoitsija owner to postgres;

create table :schema:.jr_reitinlinkki
(
    reitunnus varchar,
    suusuunta numeric,
    suuvoimast date,
    reljarjnro numeric,
    relid numeric not null
        constraint jr_reitinlinkki_pk
            primary key,
    relmatkaik numeric,
    relohaikpys numeric,
    relvpistaikpys varchar,
    relpysakki varchar,
    lnkverkko varchar,
    lnkalkusolmu varchar,
    lnkloppusolmu varchar,
    relkuka varchar,
    relviimpvm timestamp with time zone,
    pyssade numeric,
    ajantaspys numeric,
    liityntapys boolean,
    paikka boolean,
    kirjaan boolean,
    nettiin boolean,
    kirjasarake numeric,
    nettisarake numeric
);

alter table :schema:.jr_reitinlinkki owner to postgres;

create index jr_reitinlinkki_reitunnus_index
    on :schema:.jr_reitinlinkki (reitunnus);

create index jr_reitinlinkki_relpysakki_index
    on :schema:.jr_reitinlinkki (relpysakki);

create index jr_reitinlinkki_suusuunta_index
    on :schema:.jr_reitinlinkki (suusuunta);

create index jr_reitinlinkki_lnkalkusolmu_index
    on :schema:.jr_reitinlinkki (lnkalkusolmu);

create index jr_reitinlinkki_lnkloppusolmu_index
    on :schema:.jr_reitinlinkki (lnkloppusolmu);

create index jr_reitinlinkki_lnkverkko_lnkalkusolmu_lnkloppusolmu_index
    on :schema:.jr_reitinlinkki (lnkverkko, lnkalkusolmu, lnkloppusolmu);

create table :schema:.jr_reitinsuunta
(
    reitunnus varchar not null,
    suusuunta numeric not null,
    suuvoimast date not null,
    suuvoimviimpvm date not null,
    suulahpaik varchar,
    suulahpaikr varchar,
    suupaapaik varchar,
    suupaapaikr varchar,
    suuensppy boolean,
    suupituus numeric,
    suukuka varchar,
    suuviimpvm date,
    suunimilyh varchar,
    suunimilyhr varchar,
    suunimi varchar,
    suunimir varchar,
    suuhis boolean,
    pyssade numeric,
    kirjaan boolean,
    nettiin boolean,
    kirjasarake numeric,
    nettisarake numeric,
    poikkeusreitti boolean,
    constraint jr_reitinsuunta_pk
        primary key (reitunnus, suusuunta, suuvoimast, suuvoimviimpvm)
);

alter table :schema:.jr_reitinsuunta owner to postgres;

create index reitinsuunta_suunta
    on :schema:.jr_reitinsuunta (suusuunta);

create index reitinsuunta_reitunnus
    on :schema:.jr_reitinsuunta (reitunnus);

create index reitinsuunta_suupituus
    on :schema:.jr_reitinsuunta (suupituus);

create table :schema:.jr_linja_vaatimus
(
    lintunnus varchar not null,
    kookoodi numeric not null,
    kooselite varchar,
    constraint jr_linja_vaatimus_pk
        primary key (lintunnus, kookoodi)
);

alter table :schema:.jr_linja_vaatimus owner to postgres;

create index linja_vaatimus_lintunnus
    on :schema:.jr_linja_vaatimus (lintunnus);

create table :schema:.ak_kaavion_suoritteet
(
    kaaid numeric not null,
    reitunnus varchar not null,
    suunta numeric not null,
    lahaika varchar not null,
    vrkvht boolean,
    autokierto numeric not null,
    kaltyyppi varchar not null,
    metrit numeric,
    metritsiir numeric,
    sekunnit numeric,
    sekunnitsiir numeric,
    autopv numeric,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone,
    constraint ak_kaavion_suoritteet_pk
        primary key (kaaid, reitunnus, suunta, lahaika, autokierto, kaltyyppi)
);

alter table :schema:.ak_kaavion_suoritteet owner to postgres;

create index ak_kaavion_suoritteet_metrit_index
    on :schema:.ak_kaavion_suoritteet (metrit);

create index ak_kaavion_suoritteet_reitunnus_index
    on :schema:.ak_kaavion_suoritteet (reitunnus);

create index ak_kaavion_suoritteet_reitunnus_suunta_metrit_index
    on :schema:.ak_kaavion_suoritteet (reitunnus, suunta, metrit);

create index ak_kaavion_suoritteet_suunta_index
    on :schema:.ak_kaavion_suoritteet (suunta);

create index ak_kaavion_suoritteet_kaaid_index
    on :schema:.ak_kaavion_suoritteet (kaaid);

create index suorite_kaaid_reitti_aika
    on :schema:.ak_kaavion_suoritteet (reitunnus, suunta, lahaika, kaaid);

create table :schema:.jr_linkki
(
    lnkverkko varchar not null,
    lnkalkusolmu varchar not null,
    lnkloppusolmu varchar not null,
    lnkmitpituus numeric,
    lnkpituus numeric,
    lnkstid numeric,
    katkunta varchar,
    katnimi varchar,
    kaoosnro numeric,
    lnksuunta varchar,
    lnkosnro numeric,
    lnkostrk varchar(1),
    lnkkuka varchar,
    lnkviimpvm timestamp with time zone,
    lnkhis boolean
);

alter table :schema:.jr_linkki owner to postgres;

create index jr_linkki_lnkalkusolmu_index
    on :schema:.jr_linkki (lnkalkusolmu);

create index jr_linkki_lnkloppusolmu_index
    on :schema:.jr_linkki (lnkloppusolmu);

create index jr_linkki_lnkalkusolmu_lnkloppusolmu_index
    on :schema:.jr_linkki (lnkalkusolmu, lnkloppusolmu);

create table :schema:.jr_solmu
(
    soltunnus char(7) not null
        constraint jr_solmu_pk
            primary key,
    soltyyppi char,
    sollistunnus varchar(4),
    solmapiste varchar(1),
    solx numeric(7),
    soly numeric(7),
    solmx numeric(8,6),
    solmy numeric(8,6),
    solkuka varchar(20),
    solviimpvm timestamp with time zone,
    solstx numeric(7),
    solsty numeric(7),
    solx3 numeric(7),
    soly3 numeric(7),
    solstx3 numeric(7),
    solsty3 numeric(7),
    solstmx numeric(8,6),
    solstmy numeric(8,6),
    solkirjain varchar(2),
    solhis varchar(1),
    solox numeric(7),
    soloy numeric(7),
    solomx numeric(8,6),
    solomy numeric(8,6),
    solotapa varchar(1),
    mittpvm timestamp with time zone,
    mkjmx numeric(8,6),
    mkjmy numeric(8,6)
);

alter table :schema:.jr_solmu owner to postgres;

create table :schema:.jr_reitti
(
    reitunnus varchar(6) not null
        constraint jr_reitti_pk
            primary key,
    reinimi varchar(60),
    reinimilyh varchar(20),
    reinimir varchar(60),
    reinimilyhr varchar(20),
    lintunnus varchar(6),
    reikuka varchar(20),
    reiviimpvm timestamp with time zone
);

alter table :schema:.jr_reitti owner to postgres;

create table :schema:.jr_pysakki
(
    soltunnus char(7) not null
        constraint jr_pysakki_pk
            primary key,
    pyskunta char(3),
    pysnimi varchar(20),
    pysnimir varchar(20),
    pyspaikannimi varchar(20),
    pyspaikannimir varchar(20),
    pysosoite varchar(20),
    pysosoiter varchar(20),
    pysvaihtopys varchar(1),
    pyskuka varchar(20),
    pysviimpvm timestamp with time zone,
    pyslaituri varchar(15),
    pyskatos varchar(2),
    pystyyppi varchar(2),
    pyssade integer,
    pyssuunta varchar(20),
    paitunnus varchar(6),
    terminaali varchar(10),
    kutsuplus varchar(1),
    kutsuplusvyo varchar(2),
    kulkusuunta varchar(20),
    kutsuplusprior varchar(2),
    id integer,
    pysalueid varchar(6),
    tariffi varchar(3),
    elynumero varchar(10),
    pysnimipitka varchar(60),
    pysnimipitkar varchar(60),
    nimiviimpvm date,
    vyohyke varchar(6),
    postinro varchar(5)
);

alter table :schema:.jr_pysakki owner to postgres;

create table :schema:.jr_pysakkivali
(
    id integer not null
        constraint jr_pysakkivali_pk
            primary key,
    pystunnus1 char(7),
    pystunnus2 char(7),
    pituus integer,
    saantitapa char,
    mittauspvm timestamp with time zone,
    mitpituus integer,
    muuttaja varchar(20),
    muutospvm timestamp with time zone
);

alter table :schema:.jr_pysakkivali owner to postgres;

create table :schema:.jr_linja
(
    lintunnus varchar(6) not null
        constraint jr_linja_pk
            primary key,
    linperusreitti varchar(6),
    linvoimast date,
    linvoimviimpvm date,
    linjoukkollaji varchar(2),
    lintilorg varchar(3),
    linverkko varchar(1),
    linryhma varchar(3),
    linkuka varchar(20),
    linviimpvm timestamp with time zone,
    linjlkohde varchar(6),
    id varchar(4),
    vaihtoaika integer,
    linkorvtyyppi varchar(2),
    puhelinnumero varchar(20)
);

alter table :schema:.jr_linja owner to postgres;

create table :schema:.jr_lij_terminaalialue
(
    termid varchar(10) not null
        constraint jr_lij_terminaalialue_pk
            primary key,
    verkko char,
    nimi varchar(40),
    nimir varchar(40),
    solx numeric(7),
    soly numeric(7),
    solomx numeric(8,6),
    solomy numeric(8,6),
    lyhyttunnus varchar(2),
    tallpvm timestamp with time zone,
    tallentaja varchar(20),
    kuvaus varchar(20),
    kuvausr varchar(20),
    kaytossa varchar(1)
);

alter table :schema:.jr_lij_terminaalialue owner to postgres;

create table :schema:.jr_raidekalusto
(
    id integer not null
        constraint jr_raidekalusto_pk
            primary key,
    tyyppi char,
    kylkinro varchar(20),
    reknro varchar(20),
    status char,
    kaltyyppi varchar(10),
    kalluokka integer,
    lattiakorkeus char(2),
    liitunnus varchar(6),
    varikko varchar(10),
    tarkpvm date,
    kayttpvm date,
    pituus numeric(4,2),
    korkeus numeric(4,2),
    leveys numeric(4,2),
    polttoaine char(2),
    oviratkaisu varchar(3),
    istumapaikat integer,
    seisomapaikat integer,
    dilax char,
    sarja varchar(5),
    tallentaja varchar(20),
    tallpvm timestamp with time zone,
    lijkylkinro varchar(5),
    arkistointipvm timestamp with time zone,
    alkupvm date,
    loppupvm date
);

alter table :schema:.jr_raidekalusto owner to postgres;

create table :schema:.jr_korvpvkalent
(
    korvpoikpvm date not null,
    korvpaiva char(2) not null,
    korvjoukkollaji char(2) not null,
    korvviikpaiva char(2) not null,
    korvalkaika numeric(4,2),
    korvpaataika numeric(4,2),
    korvkuka varchar(20),
    korvviimpvm timestamp with time zone,
    constraint jr_korvpvkalent_pk
        primary key (korvpoikpvm, korvpaiva, korvjoukkollaji, korvviikpaiva)
);

alter table :schema:.jr_korvpvkalent owner to postgres;

create table :schema:.jr_piste
(
    lnkverkko varchar not null,
    lnkalkusolmu varchar not null,
    lnkloppusolmu varchar not null,
    pisjarjnro integer not null,
    pisid integer,
    pisx numeric(7) not null,
    pisy numeric(7) not null,
    pismx numeric(8,6),
    pismy numeric(8,6),
    piskuka varchar(20),
    pisviimpvm timestamp(3),
    constraint jr_piste_pk
        primary key (lnkverkko, lnkalkusolmu, lnkloppusolmu, pisjarjnro, pisx, pisy)
);

alter table :schema:.jr_piste owner to postgres;

create index jr_piste_lnkverkko_lnkalkusolmu_lnkloppusolmu_index
    on :schema:.jr_piste (lnkverkko, lnkalkusolmu, lnkloppusolmu);

create index jr_piste_pisjarjnro_index
    on :schema:.jr_piste (pisjarjnro);

create table :schema:.route_geometry
(
    route_id varchar not null,
    direction varchar not null,
    date_begin date not null,
    geom geometry(LineString,4326),
    constraint route_geometry_pk
        primary key (route_id, direction, date_begin)
);

alter table :schema:.route_geometry owner to postgres;

