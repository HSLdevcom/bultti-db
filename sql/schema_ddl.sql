create schema if not exists jore;
alter schema jore owner to postgres;

create table jore.ak_aikataulukausi
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

alter table jore.ak_aikataulukausi owner to postgres;

create table jore.ak_kaavio
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

alter table jore.ak_kaavio owner to postgres;

create index ak_kaavio_kaaid_index
    on jore.ak_kaavio (kaaid);

create index ak_kaavio_kaatunnus_index
    on jore.ak_kaavio (kaatunnus);

create index ak_kaavio_kaatunnus_kaaversio_index
    on jore.ak_kaavio (kaatunnus, kaaversio);

create index ak_kaavio_kaaversio_index
    on jore.ak_kaavio (kaaversio);

create index ak_kaavio_kohtunnus_index
    on jore.ak_kaavio (kohtunnus);

create index ak_kaavio_pvtyyppi_index
    on jore.ak_kaavio (pvtyyppi);

create index ak_kaavio_kaavoimast_index
    on jore.ak_kaavio (kaavoimast);

create index ak_kaavio_kaaviimvoi_index
    on jore.ak_kaavio (kaaviimvoi);

create index ak_kaavio_validity_period_index
    on jore.ak_kaavio (kaavoimast, kaaviimvoi);

create table jore.ak_kaavion_lahto
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

alter table jore.ak_kaavion_lahto owner to postgres;

create index reitunnus
    on jore.ak_kaavion_lahto (reitunnus);

create index kaaid
    on jore.ak_kaavion_lahto (kaaid);

create index suunta
    on jore.ak_kaavion_lahto (suunta);

create index kaltyyppi
    on jore.ak_kaavion_lahto (kaltyyppi);

create index liitunnus
    on jore.ak_kaavion_lahto (liitunnus);

create index lahto_lahtoaika
    on jore.ak_kaavion_lahto (lahaika);

create table jore.jr_ajoneuvo
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

alter table jore.jr_ajoneuvo owner to postgres;

create index ajoneuvo_reknro
    on jore.jr_ajoneuvo (reknro);

create index ajoneuvo_kylkinro
    on jore.jr_ajoneuvo (kylkinro);

create index ajoneuvo_rekpvm
    on jore.jr_ajoneuvo (rekpvm);

create table jore.jr_eritpvkalent
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

alter table jore.jr_eritpvkalent owner to postgres;

create table jore.jr_inf_aikataulu_vp
(
    solmutunnus numeric not null,
    reitunnus varchar not null,
    suunta numeric not null,
    paiva varchar not null,
    jarjnro numeric not null,
    vrkvht boolean not null,
    ohitustunnit numeric not null,
    ohitusminuutit numeric not null,
    matlatt boolean,
    lavoimast date not null,
    laviimvoi date not null,
    tyyppi numeric not null,
    voimok boolean,
    viitem varchar,
    kaltyyppi numeric,
    tvrkvht boolean,
    tohitustunnit numeric,
    tohitusminuutit numeric,
    maksviivaika numeric,
    id numeric not null,
    ajotyyppi varchar not null,
    constraint jr_inf_aikataulu_vp_pk
        primary key (solmutunnus, reitunnus, suunta, paiva, ohitustunnit, ohitusminuutit, lavoimast, laviimvoi, ajotyyppi, tyyppi, jarjnro)
);

alter table jore.jr_inf_aikataulu_vp owner to postgres;

create index jr_inf_aikataulu_vp_jarjnro_index
    on jore.jr_inf_aikataulu_vp (jarjnro);

create index jr_inf_aikataulu_vp_paiva_index
    on jore.jr_inf_aikataulu_vp (paiva);

create index jr_inf_aikataulu_vp_solmutunnus_index
    on jore.jr_inf_aikataulu_vp (solmutunnus);

create index jr_inf_aikataulu_vp_reitunnus_index
    on jore.jr_inf_aikataulu_vp (reitunnus);

create table jore.jr_inf_kohde
(
    kohtunnus varchar not null,
    kohalkpvm date,
    kohpaattpvm date,
    kohtilorg varchar,
    ilmoitus1 numeric,
    ilmoitus2 boolean,
    selite varchar,
    lintunnus varchar not null,
    liitunnus numeric not null,
    liirooli numeric,
    liialkpvm date not null,
    liipaattpvm date not null,
    koulutus numeric,
    helmi numeric,
    perehdytys numeric,
    constraint jr_inf_kohde_pk
        primary key (kohtunnus, lintunnus, liitunnus, liialkpvm, liipaattpvm)
);

alter table jore.jr_inf_kohde owner to postgres;

create index operator_id
    on jore.jr_inf_kohde (liitunnus);

create index line_id
    on jore.jr_inf_kohde (lintunnus);

create index kohtunnus_operator_line_id
    on jore.jr_inf_kohde (kohtunnus, liitunnus, lintunnus);

create index start_date_end_date
    on jore.jr_inf_kohde (kohalkpvm, kohpaattpvm);

create table jore.jr_kilpailukohd
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

alter table jore.jr_kilpailukohd owner to postgres;

create index kohtunnus
    on jore.jr_kilpailukohd (kohtunnus);

create index seuranta
    on jore.jr_kilpailukohd (seuranta);

create index kohtunnus_seuranta_not_null
    on jore.jr_kilpailukohd (kohtunnus)
    where (seuranta IS NOT NULL);

create index kohde_liitunnus
    on jore.jr_kilpailukohd (liitunnus);

create table jore.jr_konserni
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

alter table jore.jr_konserni owner to postgres;

create table jore.jr_koodisto
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

alter table jore.jr_koodisto owner to postgres;

create table jore.jr_liikennoitsija
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

alter table jore.jr_liikennoitsija owner to postgres;

create table jore.jr_reitinlinkki
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

alter table jore.jr_reitinlinkki owner to postgres;

create index jr_reitinlinkki_reitunnus_index
    on jore.jr_reitinlinkki (reitunnus);

create index jr_reitinlinkki_relpysakki_index
    on jore.jr_reitinlinkki (relpysakki);

create index jr_reitinlinkki_suusuunta_index
    on jore.jr_reitinlinkki (suusuunta);

create index jr_reitinlinkki_lnkalkusolmu_index
    on jore.jr_reitinlinkki (lnkalkusolmu);

create index jr_reitinlinkki_lnkloppusolmu_index
    on jore.jr_reitinlinkki (lnkloppusolmu);

create index jr_reitinlinkki_lnkverkko_lnkalkusolmu_lnkloppusolmu_index
    on jore.jr_reitinlinkki (lnkverkko, lnkalkusolmu, lnkloppusolmu);

create table jore.jr_reitinsuunta
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

alter table jore.jr_reitinsuunta owner to postgres;

create index reitinsuunta_suunta
    on jore.jr_reitinsuunta (suusuunta);

create index reitinsuunta_reitunnus
    on jore.jr_reitinsuunta (reitunnus);

create index reitinsuunta_suupituus
    on jore.jr_reitinsuunta (suupituus);

create table jore.jr_kinf_linja3
(
    reitunnus varchar not null,
    suuvoimast date not null,
    suuviimvoi date not null,
    suunta numeric not null,
    reitinnimi varchar,
    reitinnimir varchar,
    jllaji numeric,
    lahpaik varchar,
    lahpaikr varchar,
    lahsolmu varchar,
    pituus numeric,
    paapaik varchar,
    paapaikr varchar,
    paasolmu varchar,
    nimilyh varchar,
    nimilyhr varchar,
    constraint jr_kinf_linja3_pk
        primary key (reitunnus, suunta, suuvoimast, suuviimvoi)
);

alter table jore.jr_kinf_linja3 owner to postgres;

create index kinf_linja3_reitti
    on jore.jr_kinf_linja3 (reitunnus);

create index kinf_linja3_suunta
    on jore.jr_kinf_linja3 (suunta);

create index kinf_linja3_reitti_suunta
    on jore.jr_kinf_linja3 (reitunnus, suunta);

create index kinf_linja3_solmu1
    on jore.jr_kinf_linja3 (lahsolmu);

create index kinf_linja3_solmu2
    on jore.jr_kinf_linja3 (paasolmu);

create table jore.jr_linja_vaatimus
(
    lintunnus varchar not null,
    kookoodi numeric not null,
    kooselite varchar,
    constraint jr_linja_vaatimus_pk
        primary key (lintunnus, kookoodi)
);

alter table jore.jr_linja_vaatimus owner to postgres;

create index linja_vaatimus_lintunnus
    on jore.jr_linja_vaatimus (lintunnus);

create table jore.ak_kaavion_suoritteet
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

alter table jore.ak_kaavion_suoritteet owner to postgres;

create index ak_kaavion_suoritteet_metrit_index
    on jore.ak_kaavion_suoritteet (metrit);

create index ak_kaavion_suoritteet_reitunnus_index
    on jore.ak_kaavion_suoritteet (reitunnus);

create index ak_kaavion_suoritteet_reitunnus_suunta_metrit_index
    on jore.ak_kaavion_suoritteet (reitunnus, suunta, metrit);

create index ak_kaavion_suoritteet_suunta_index
    on jore.ak_kaavion_suoritteet (suunta);

create index ak_kaavion_suoritteet_kaaid_index
    on jore.ak_kaavion_suoritteet (kaaid);

create index suorite_kaaid_reitti_aika
    on jore.ak_kaavion_suoritteet (reitunnus, suunta, lahaika, kaaid);

create table jore.jr_kinf_kalusto
(
    tyyppi varchar,
    reknro varchar not null,
    kylkinro varchar not null,
    ika numeric,
    kaltyyppi varchar,
    teli boolean,
    ulkovari varchar,
    liitunnus numeric not null,
    paastoluokka numeric,
    paastoluokkaselite varchar,
    constraint jr_kinf_kalusto_pkey
        primary key (reknro, kylkinro, liitunnus)
);

alter table jore.jr_kinf_kalusto owner to postgres;

create index kalusto_reknro
    on jore.jr_kinf_kalusto (reknro);

create index kalusto_liitunnus
    on jore.jr_kinf_kalusto (liitunnus);

create index kalusto_kylkinro
    on jore.jr_kinf_kalusto (kylkinro);

create index kalusto_tyyppi
    on jore.jr_kinf_kalusto (tyyppi);

create index kalusto_paastoluokka
    on jore.jr_kinf_kalusto (paastoluokka);

create table jore.jr_linkki
(
    lnkverkko numeric not null,
    lnkalkusolmu varchar not null,
    lnkloppusolmu varchar not null,
    lnkmitpituus numeric,
    lnkpituus numeric,
    lnkstid numeric,
    katkunta numeric,
    katnimi varchar,
    kaoosnro numeric,
    lnksuunta numeric,
    lnkosnro numeric,
    lnkostrk varchar,
    lnkkuka varchar,
    lnkviimpvm timestamp with time zone,
    lnkhis boolean,
    constraint jr_linkki_pk
        primary key (lnkalkusolmu, lnkloppusolmu, lnkverkko)
);

alter table jore.jr_linkki owner to postgres;

create index jr_linkki_lnkalkusolmu_index
    on jore.jr_linkki (lnkalkusolmu);

create index jr_linkki_lnkalkusolmu_lnkloppusolmu_index
    on jore.jr_linkki (lnkalkusolmu, lnkloppusolmu);

create index jr_linkki_lnkloppusolmu_index
    on jore.jr_linkki (lnkloppusolmu);

create table jore.ak_kalusto
(
    katyyppi char(2) not null
        constraint ak_kalusto_pk
            primary key,
    kamatlatt char,
    kaselite varchar(40),
    jarjnro smallint,
    perustaja varchar(8),
    perustpvm timestamp with time zone,
    muuttaja varchar(8),
    muutospvm timestamp with time zone
);

alter table jore.ak_kalusto owner to postgres;

create table jore.jr_inf_joukkollaji
(
    koodi char(2) not null
        constraint jr_inf_joukkollaji_pk
            primary key,
    selite char(50)
);

alter table jore.jr_inf_joukkollaji owner to postgres;

create table jore.jr_inf_liik
(
    liitunnus numeric not null
        constraint jr_inf_liik_pk
            primary key,
    liinimi varchar(40)
);

alter table jore.jr_inf_liik owner to postgres;

create table jore.jr_solmu
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

alter table jore.jr_solmu owner to postgres;

create table jore.jr_reitti
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

alter table jore.jr_reitti owner to postgres;

create table jore.jr_pysakki
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

alter table jore.jr_pysakki owner to postgres;

create table jore.jr_pysakkivali
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

alter table jore.jr_pysakkivali owner to postgres;

create table jore.jr_linja
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

alter table jore.jr_linja owner to postgres;

create table jore.jr_lij_terminaalialue
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

alter table jore.jr_lij_terminaalialue owner to postgres;

create table jore.jr_raidekalusto
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

alter table jore.jr_raidekalusto owner to postgres;

create table jore.jr_korvpvkalent
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

alter table jore.jr_korvpvkalent owner to postgres;

create table jore.jr_piste
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

alter table jore.jr_piste owner to postgres;

create index jr_piste_lnkverkko_lnkalkusolmu_lnkloppusolmu_index
    on jore.jr_piste (lnkverkko, lnkalkusolmu, lnkloppusolmu);

create index jr_piste_pisjarjnro_index
    on jore.jr_piste (pisjarjnro);

create table jore.route_geometry
(
    route_id varchar not null,
    direction varchar not null,
    date_begin date not null,
    date_end date not null,
    route_length numeric,
    start_stop varchar,
    end_stop varchar,
    geojson varchar,
    constraint route_geometry_pk
        primary key (route_id, direction, date_begin, date_end)
);

alter table jore.route_geometry owner to postgres;

create index route_geometry_date_begin_date_end_index
    on jore.route_geometry (date_begin, date_end);

create index route_geometry_direction_index
    on jore.route_geometry (direction);

create index route_geometry_route_id_direction_index
    on jore.route_geometry (route_id, direction);

create index route_geometry_route_id_index
    on jore.route_geometry (route_id);

