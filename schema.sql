create schema if not exists jore;
alter schema jore owner to postgres;

SET schema 'jore';

create table ak_aikataulukausi
(
    aktunnus varchar not null
        constraint ak_aikataulukausi_pkey
            primary key,
    akalkpvm date not null,
    akpaattpvm date not null,
    kausi numeric,
    aikajakso varchar,
    kommentti varchar,
    perustaja varchar,
    perustpvm timestamp with time zone,
    muuttaja varchar,
    muutospvm timestamp with time zone
);

alter table ak_aikataulukausi owner to postgres;

create index ak_aikataulukausi_akalkpvm_akpaattpvm_index
    on ak_aikataulukausi (akalkpvm, akpaattpvm);

create index ak_aikataulukausi_aktunnus_index
    on ak_aikataulukausi (aktunnus);

create table ak_kaavio
(
    aktunnus varchar not null,
    kaatunnus varchar not null,
    kaavoimast date,
    pvtyyppi varchar,
    kaaversio numeric not null,
    kaaid numeric not null,
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
    haspvtyyppi varchar,
    constraint ak_kaavio_pk
        primary key (aktunnus, kaaversio, kaatunnus, kaaid)
);

alter table ak_kaavio owner to postgres;

create index ak_kaavio_kaaid_index
    on ak_kaavio (kaaid);

create index ak_kaavio_kaatunnus_index
    on ak_kaavio (kaatunnus);

create index ak_kaavio_kaatunnus_kaaversio_index
    on ak_kaavio (kaatunnus, kaaversio);

create index ak_kaavio_kaaversio_index
    on ak_kaavio (kaaversio);

create index ak_kaavio_kohtunnus_index
    on ak_kaavio (kohtunnus);

create index ak_kaavio_pvtyyppi_index
    on ak_kaavio (pvtyyppi);

create index ak_kaavio_kaavoimast_index
    on ak_kaavio (kaavoimast);

create index ak_kaavio_kaaviimvoi_index
    on ak_kaavio (kaaviimvoi);

create index ak_kaavio_validity_period_index
    on ak_kaavio (kaavoimast, kaaviimvoi);

create table ak_kaavion_lahto
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

alter table ak_kaavion_lahto owner to postgres;

create index reitunnus
    on ak_kaavion_lahto (reitunnus);

create index kaaid
    on ak_kaavion_lahto (kaaid);

create index suunta
    on ak_kaavion_lahto (suunta);

create index kaltyyppi
    on ak_kaavion_lahto (kaltyyppi);

create index liitunnus
    on ak_kaavion_lahto (liitunnus);

create index lahto_lahtoaika
    on ak_kaavion_lahto (lahaika);

create table jr_ajoneuvo
(
    id varchar not null,
    status varchar,
    liitunnus varchar not null,
    varikko varchar,
    reknro varchar not null,
    kylkinro varchar not null,
    kaltyyppi varchar not null,
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
    rekpvm date not null,
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
        primary key (id, reknro, kylkinro, liitunnus)
);

alter table jr_ajoneuvo owner to postgres;

create index ajoneuvo_reknro
    on jr_ajoneuvo (reknro);

create index ajoneuvo_kylkinro
    on jr_ajoneuvo (kylkinro);

create index ajoneuvo_rekpvm
    on jr_ajoneuvo (rekpvm);

create table jr_eritpvkalent
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

alter table jr_eritpvkalent owner to postgres;

create index jr_eritpvkalent_eritpoikpvm_eritpaiva_eritviikpaiva_index
    on jr_eritpvkalent (eritpoikpvm, eritpaiva, eritviikpaiva);

create index jr_eritpvkalent_eritpoikpvm_index
    on jr_eritpvkalent (eritpoikpvm);

create table jr_kilpailukohd
(
    kohtunnus varchar not null,
    kohtilorg varchar,
    kohalkpvm date not null,
    kohpaattpvm date not null,
    liikaloituspvm date,
    muuttunut numeric,
    muutospvm date,
    kohnimi varchar,
    liitunnus numeric default 0 not null,
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
    louhinkoodi numeric,
    constraint jr_kilpailukohd_pk
        primary key (kohtunnus, liitunnus, kohalkpvm, kohpaattpvm)
);

alter table jr_kilpailukohd owner to postgres;

create index kohtunnus
    on jr_kilpailukohd (kohtunnus);

create index seuranta
    on jr_kilpailukohd (seuranta);

create index kohtunnus_seuranta_not_null
    on jr_kilpailukohd (kohtunnus)
    where (seuranta IS NOT NULL);

create index kohde_liitunnus
    on jr_kilpailukohd (liitunnus);

create table jr_konserni
(
    kontunnus numeric not null,
    konlyhenne varchar,
    konnimi varchar not null,
    tallpvm timestamp with time zone,
    tallentaja varchar,
    ytunnus varchar,
    status numeric,
    constraint jr_konserni_pkey
        primary key (kontunnus, konnimi)
);

alter table jr_konserni owner to postgres;

create table jr_koodisto
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

alter table jr_koodisto owner to postgres;

create index jr_koodisto_kookoodi_index
    on jr_koodisto (kookoodi);

create table jr_liikennoitsija
(
    liitunnus numeric not null
        constraint jr_liikennoitsija_pk
            primary key,
    liinimi varchar not null,
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

alter table jr_liikennoitsija owner to postgres;

create index jr_liikennoitsija_liitunnus_index
    on jr_liikennoitsija (liitunnus);

create table jr_reitinlinkki
(
    reitunnus varchar not null,
    suusuunta numeric not null,
    suuvoimast timestamp with time zone not null,
    reljarjnro numeric not null,
    relid numeric not null,
    relmatkaik numeric,
    relohaikpys numeric,
    relvpistaikpys varchar,
    relpysakki varchar not null,
    lnkverkko varchar not null,
    lnkalkusolmu varchar not null,
    lnkloppusolmu varchar not null,
    relkuka varchar,
    relviimpvm timestamp with time zone,
    pyssade numeric,
    ajantaspys numeric,
    liityntapys boolean,
    paikka boolean,
    kirjaan boolean,
    nettiin boolean,
    kirjasarake numeric,
    nettisarake numeric,
    constraint jr_reitinlinkki_pk
        primary key (reitunnus, suusuunta, suuvoimast, reljarjnro, relid, relpysakki, lnkverkko, lnkalkusolmu, lnkloppusolmu)
);

alter table jr_reitinlinkki owner to postgres;

create index jr_reitinlinkki_reitunnus_index
    on jr_reitinlinkki (reitunnus);

create index jr_reitinlinkki_relpysakki_index
    on jr_reitinlinkki (relpysakki);

create index jr_reitinlinkki_suusuunta_index
    on jr_reitinlinkki (suusuunta);

create index jr_reitinlinkki_lnkalkusolmu_index
    on jr_reitinlinkki (lnkalkusolmu);

create index jr_reitinlinkki_lnkloppusolmu_index
    on jr_reitinlinkki (lnkloppusolmu);

create index jr_reitinlinkki_lnkverkko_lnkalkusolmu_lnkloppusolmu_index
    on jr_reitinlinkki (lnkverkko, lnkalkusolmu, lnkloppusolmu);

create index jr_reitinlinkki_lnkalkusolmu_relpysakki_index
    on jr_reitinlinkki (lnkalkusolmu, relpysakki);

create table jr_reitinsuunta
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

alter table jr_reitinsuunta owner to postgres;

create index reitinsuunta_suunta
    on jr_reitinsuunta (suusuunta);

create index reitinsuunta_reitunnus
    on jr_reitinsuunta (reitunnus);

create index reitinsuunta_suupituus
    on jr_reitinsuunta (suupituus);

create index jr_reitinsuunta_reitunnus_suusuunta_suuvoimast_suuvoimviimpvm_i
    on jr_reitinsuunta (reitunnus, suusuunta, suuvoimast, suuvoimviimpvm);

create table jr_linja_vaatimus
(
    lintunnus varchar not null,
    kookoodi numeric not null,
    kooselite varchar,
    constraint jr_linja_vaatimus_pk
        primary key (lintunnus, kookoodi)
);

alter table jr_linja_vaatimus owner to postgres;

create index linja_vaatimus_lintunnus
    on jr_linja_vaatimus (lintunnus);

create table ak_kaavion_suoritteet
(
    kaaid numeric not null,
    reitunnus varchar not null,
    suunta numeric not null,
    lahaika varchar not null,
    vrkvht boolean,
    autokierto numeric not null,
    kaltyyppi varchar not null,
    metrit numeric default 0 not null,
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

alter table ak_kaavion_suoritteet owner to postgres;

create index ak_kaavion_suoritteet_metrit_index
    on ak_kaavion_suoritteet (metrit);

create index ak_kaavion_suoritteet_reitunnus_index
    on ak_kaavion_suoritteet (reitunnus);

create index ak_kaavion_suoritteet_reitunnus_suunta_metrit_index
    on ak_kaavion_suoritteet (reitunnus, suunta, metrit);

create index ak_kaavion_suoritteet_suunta_index
    on ak_kaavion_suoritteet (suunta);

create index ak_kaavion_suoritteet_kaaid_index
    on ak_kaavion_suoritteet (kaaid);

create index suorite_kaaid_reitti_aika
    on ak_kaavion_suoritteet (reitunnus, suunta, lahaika, kaaid);

create table jr_solmu
(
    soltunnus char(7) not null
        constraint jr_solmu_pk
            primary key,
    soltyyppi char,
    sollistunnus varchar(4),
    solmapiste varchar(1),
    solx numeric(7) not null,
    soly numeric(7) not null,
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

alter table jr_solmu owner to postgres;

create index jr_solmu_solsty_solstx_index
    on jr_solmu (solsty, solstx);

create index jr_solmu_soltunnus_index
    on jr_solmu (soltunnus);

create index jr_solmu_soltunnus_solsty_solstx_index
    on jr_solmu (soltunnus, solsty, solstx);

create index jr_solmu_soltunnus_soly_solx_index
    on jr_solmu (soltunnus, soly, solx);

create index jr_solmu_soly_solx_index
    on jr_solmu (soly, solx);

create table jr_reitti
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

alter table jr_reitti owner to postgres;

create index jr_reitti_reitunnus_index
    on jr_reitti (reitunnus);

create table jr_pysakki
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

alter table jr_pysakki owner to postgres;

create index jr_pysakki_soltunnus_index
    on jr_pysakki (soltunnus);

create index jr_pysakki_terminaali_index
    on jr_pysakki (terminaali);

create table jr_pysakkivali
(
    id integer not null,
    pystunnus1 char(7) not null,
    pystunnus2 char(7) not null,
    pituus integer,
    saantitapa char,
    mittauspvm timestamp with time zone,
    mitpituus integer,
    muuttaja varchar(20),
    muutospvm timestamp with time zone,
    constraint jr_pysakkivali_pk
        primary key (id, pystunnus1, pystunnus2)
);

alter table jr_pysakkivali owner to postgres;

create index jr_pysakkivali_pystunnus1_pystunnus2_index
    on jr_pysakkivali (pystunnus1, pystunnus2);

create table jr_linja
(
    lintunnus varchar(6) not null
        constraint jr_linja_pk
            primary key,
    linperusreitti varchar(6),
    linvoimast date,
    linvoimviimpvm date,
    linjoukkollaji varchar(2) not null,
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

alter table jr_linja owner to postgres;

create index jr_linja_linjoukkollaji_index
    on jr_linja (linjoukkollaji);

create index jr_linja_lintunnus_index
    on jr_linja (lintunnus);

create index jr_linja_lintunnus_linvoimast_linvoimviimpvm_index
    on jr_linja (lintunnus, linvoimast, linvoimviimpvm);

create table jr_lij_terminaalialue
(
    termid varchar(10) not null
        constraint jr_lij_terminaalialue_pk
            primary key,
    verkko char,
    nimi varchar(40),
    nimir varchar(40),
    solx numeric(7) not null,
    soly numeric(7) not null,
    solomx numeric(8,6),
    solomy numeric(8,6),
    lyhyttunnus varchar(2),
    tallpvm timestamp with time zone,
    tallentaja varchar(20),
    kuvaus varchar(20),
    kuvausr varchar(20),
    kaytossa varchar(1)
);

alter table jr_lij_terminaalialue owner to postgres;

create index jr_lij_terminaalialue_termid_index
    on jr_lij_terminaalialue (termid);

create table jr_raidekalusto
(
    id integer not null,
    tyyppi char,
    kylkinro varchar(20) not null,
    reknro varchar(20) not null,
    status char,
    kaltyyppi varchar(10),
    kalluokka integer,
    lattiakorkeus char(2),
    liitunnus varchar(6) not null,
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
    loppupvm date,
    constraint jr_raidekalusto_pk
        primary key (id, kylkinro, reknro, liitunnus)
);

alter table jr_raidekalusto owner to postgres;

create index jr_raidekalusto_kylkinro_index
    on jr_raidekalusto (kylkinro);

create index jr_raidekalusto_kylkinro_liitunnus_index
    on jr_raidekalusto (kylkinro, liitunnus);

create index jr_raidekalusto_reknro_index
    on jr_raidekalusto (reknro);

create index jr_raidekalusto_reknro_kayttpvm_index
    on jr_raidekalusto (reknro, kayttpvm);

create table jr_korvpvkalent
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

alter table jr_korvpvkalent owner to postgres;

create index jr_korvpvkalent_korvjoukkollaji_index
    on jr_korvpvkalent (korvjoukkollaji);

create index jr_korvpvkalent_korvpaiva_index
    on jr_korvpvkalent (korvpaiva);

create index jr_korvpvkalent_korvpoikpvm_index
    on jr_korvpvkalent (korvpoikpvm);

create table jr_piste
(
    lnkverkko varchar not null,
    lnkalkusolmu varchar not null,
    lnkloppusolmu varchar not null,
    pisjarjnro integer not null,
    pisid integer not null,
    pisx numeric(7) not null,
    pisy numeric(7) not null,
    pismx numeric(8,6),
    pismy numeric(8,6),
    piskuka varchar(20),
    pisviimpvm timestamp(3),
    constraint jr_piste_pk
        primary key (lnkverkko, lnkalkusolmu, lnkloppusolmu, pisjarjnro, pisid, pisx, pisy)
);

alter table jr_piste owner to postgres;

create index jr_piste_lnkverkko_lnkalkusolmu_lnkloppusolmu_index
    on jr_piste (lnkverkko, lnkalkusolmu, lnkloppusolmu);

create index jr_piste_pisjarjnro_index
    on jr_piste (pisjarjnro);

create index jr_piste_pisx_pisy_index
    on jr_piste (pisx, pisy);

create table route_geometry
(
    route_id varchar not null,
    direction numeric not null,
    date_begin date not null,
    geom geometry(LineString,4326),
    constraint route_geometry_pk
        primary key (route_id, direction, date_begin)
);

alter table route_geometry owner to postgres;

create index route_geometry_route_id_index
    on route_geometry (route_id);

create index route_geometry_route_id_direction_date_begin_index
    on route_geometry (route_id, direction, date_begin);

create index route_geometry_route_id_direction_index
    on route_geometry (route_id, direction);

create table jr_linkki
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

alter table jr_linkki owner to postgres;

create index jr_linkki_lnkalkusolmu_index
    on jr_linkki (lnkalkusolmu);

create index jr_linkki_lnkloppusolmu_index
    on jr_linkki (lnkloppusolmu);

create index jr_linkki_lnkverkko_lnkalkusolmu_lnkloppusolmu_index
    on jr_linkki (lnkverkko, lnkalkusolmu, lnkloppusolmu);

create table jr_lahto
(
    reitunnus varchar not null,
    lavoimast timestamp with time zone not null,
    lhpaivat char(2) not null,
    lhsuunta numeric not null,
    lhvrkvht char not null,
    lhlahaik numeric(4,2) not null,
    lhjarjnro smallint,
    lhajotyyppi varchar(2),
    lhmatlatt varchar(1),
    lhviitem varchar(4),
    lhvoimok varchar(2),
    lhkuka varchar(20),
    lhviimpvm timestamp with time zone,
    lhkaltyyppi varchar(2),
    kohtunnus varchar(12),
    termaika integer,
    elpymisaika integer,
    pakollkaltyyppi varchar(2),
    maksviivaika integer,
    junanumero integer,
    yksikkolkm integer,
    "LIJid" integer,
    constraint jr_lahto_pk
        primary key (reitunnus, lhsuunta, lavoimast, lhpaivat, lhvrkvht, lhlahaik)
);

alter table jr_lahto owner to postgres;

create index jr_lahto_lhlahaik_index
    on jr_lahto (lhlahaik);

create index jr_lahto_lhpaivat_index
    on jr_lahto (lhpaivat);

create index jr_lahto_lhpaivat_lhlahaik_index
    on jr_lahto (lhpaivat, lhlahaik);

create index jr_lahto_reitunnus_index
    on jr_lahto (reitunnus);

create index jr_lahto_reitunnus_lhsuunta_lavoimast_index
    on jr_lahto (reitunnus, lhsuunta, lavoimast);

create table jr_aikataulu
(
    reitunnus varchar not null,
    lavoimast timestamp with time zone not null,
    laviimvoi timestamp with time zone not null,
    lakuka varchar(20),
    laviimpvm timestamp with time zone,
    constraint jr_aikataulu_pk
        primary key (reitunnus, lavoimast, laviimvoi)
);

alter table jr_aikataulu owner to postgres;

create index jr_aikataulu_lavoimast_laviimvoi_index
    on jr_aikataulu (lavoimast, laviimvoi);

create index jr_aikataulu_reitunnus_index
    on jr_aikataulu (reitunnus);

create table jr_liik_kilpa_suhde
(
    liitunnus varchar(6) not null,
    kohtunnus varchar(12) not null,
    liirooli varchar(2),
    liialkpvm timestamp with time zone,
    liipaattpvm timestamp with time zone,
    constraint jr_liik_kilpa_suhde_pk
        primary key (liitunnus, kohtunnus)
);

alter table jr_liik_kilpa_suhde owner to postgres;

create index jr_liik_kilpa_suhde_kohtunnus_index
    on jr_liik_kilpa_suhde (kohtunnus);

create index jr_liik_kilpa_suhde_liitunnus_index
    on jr_liik_kilpa_suhde (liitunnus);

create table jr_valipisteaika
(
    reitunnus varchar,
    lavoimast timestamp with time zone,
    lhpaivat char(2),
    lhsuunta numeric,
    lhvrkvht char,
    lhlahaik numeric(4,2),
    vastunnus char(7),
    vaslaika numeric(4,2),
    vaslvrkvht char,
    vasjarjnro smallint,
    vaskuka varchar(20),
    vasviimpvm timestamp with time zone,
    vaslahde varchar(2),
    vastaika numeric(4,2),
    vastvrkvht char,
    raide char(3)
);

alter table jr_valipisteaika owner to postgres;

