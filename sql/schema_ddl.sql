create schema jore;
alter schema jore owner to postgres;

create table jore.ak_aikataulukausi
(
    aktunnus varchar not null
        constraint ak_aikataulukausi_pkey
            primary key,
    akalkpvm timestamp with time zone,
    akpaattpvm timestamp with time zone,
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
    kaavoimast timestamp with time zone,
    pvtyyppi varchar,
    kaaversio numeric,
    kaaid numeric not null
        constraint ak_kaavio_pkey
            primary key,
    kaaviimvoi timestamp with time zone,
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

create table jore.ak_kaavion_lahto
(
    kaaid numeric,
    reitunnus varchar,
    suunta numeric,
    lahaika varchar,
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
    termaika varchar,
    elpymisaika varchar,
    pakollkaltyyppi boolean,
    liitunnus numeric,
    saapaika varchar
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

create table jore.jr_ajoneuvo
(
    id varchar,
    status varchar,
    liitunnus varchar,
    varikko varchar,
    reknro varchar,
    kylkinro varchar,
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
    rekpvm timestamp with time zone,
    kayttpvm timestamp with time zone,
    voimast timestamp with time zone,
    viimvoi timestamp with time zone,
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
    yliikaisyys numeric
);

alter table jore.jr_ajoneuvo owner to postgres;

create table jore.jr_eritpvkalent
(
    eritpoikpvm timestamp with time zone not null,
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
    solmutunnus numeric,
    reitunnus varchar,
    suunta numeric,
    paiva varchar,
    jarjnro numeric,
    vrkvht boolean,
    ohitustunnit numeric,
    ohitusminuutit numeric,
    matlatt boolean,
    lavoimast timestamp with time zone,
    laviimvoi timestamp with time zone,
    tyyppi numeric,
    voimok boolean,
    viitem varchar,
    kaltyyppi numeric,
    tvrkvht boolean,
    tohitustunnit numeric,
    tohitusminuutit numeric,
    maksviivaika numeric,
    id numeric not null
        constraint jr_inf_aikataulu_vp_pkey
            primary key,
    ajotyyppi varchar
);

alter table jore.jr_inf_aikataulu_vp owner to postgres;

create table jore.jr_inf_eritpv
(
    koodi varchar not null
        constraint jr_inf_eritpv_pkey
            primary key,
    selite varchar
);

alter table jore.jr_inf_eritpv owner to postgres;

create table jore.jr_inf_kohde
(
    kohtunnus varchar not null,
    kohalkpvm timestamp with time zone,
    kohpaattpvm timestamp with time zone,
    kohtilorg varchar,
    ilmoitus1 numeric,
    ilmoitus2 boolean,
    selite varchar,
    lintunnus varchar not null,
    liitunnus numeric not null,
    liirooli numeric,
    liialkpvm timestamp with time zone not null,
    liipaattpvm timestamp with time zone not null,
    koulutus numeric,
    helmi numeric,
    perehdytys numeric,
    constraint jr_inf_kohde_pkey
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

create table jore.jr_inf_liik
(
    liitunnus numeric not null
        constraint jr_inf_liik_pkey
            primary key,
    liinimi varchar
);

alter table jore.jr_inf_liik owner to postgres;

create table jore.jr_kilpailukohd
(
    kohtunnus varchar,
    kohtilorg varchar,
    kohalkpvm varchar,
    kohpaattpvm varchar,
    liikaloituspvm varchar,
    muuttunut numeric,
    muutospvm varchar,
    kohnimi varchar,
    liitunnus numeric,
    kohtarjouspvm varchar,
    kohindeksipvm varchar,
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
    kohviimpvm timestamp with time zone,
    tilnro varchar,
    ilmoitus1 numeric,
    ilmoitus2 boolean,
    selite varchar,
    perehdytys numeric,
    koulutus numeric,
    helmi numeric,
    sopimusno varchar,
    sloppupvm timestamp with time zone,
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
    koolista varchar,
    koojarjestys numeric,
    kookoodi varchar,
    kooselite varchar,
    koonumero numeric,
    tyyppinumero1 numeric,
    tyyppinimi1 varchar,
    tyyppinimi2 varchar,
    koodityyppi varchar
);

alter table jore.jr_koodisto owner to postgres;

create table jore.jr_liikennoitsija
(
    liitunnus numeric,
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
    liiviimpvm timestamp,
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
    suuvoimast timestamp with time zone,
    reljarjnro numeric,
    relid numeric,
    relmatkaik numeric,
    relohaikpys numeric,
    relvpistaikpys varchar,
    relpysakki varchar,
    lnkverkko numeric,
    lnkalkusolmu numeric,
    lnkloppusolmu numeric,
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

create table jore.jr_reitinsuunta
(
    reitunnus varchar,
    suusuunta numeric,
    suuvoimast timestamp with time zone,
    suuvoimviimpvm timestamp with time zone,
    suulahpaik varchar,
    suulahpaikr varchar,
    suupaapaik varchar,
    suupaapaikr varchar,
    suuensppy boolean,
    suupituus numeric,
    suukuka varchar,
    suuviimpvm timestamp with time zone,
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
    poikkeusreitti boolean
);

alter table jore.jr_reitinsuunta owner to postgres;

create index reitinsuunta_suunta
    on jore.jr_reitinsuunta (suusuunta);

create index reitinsuunta_reitunnus
    on jore.jr_reitinsuunta (reitunnus);

create index reitinsuunta_suupituus
    on jore.jr_reitinsuunta (suupituus);

