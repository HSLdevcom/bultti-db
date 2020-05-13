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

CREATE INDEX ajoneuvo_reknro ON jore.jr_ajoneuvo (reknro);
CREATE INDEX ajoneuvo_rekpvm ON jore.jr_ajoneuvo (rekpvm);
CREATE INDEX ajoneuvo_kylkinro ON jore.jr_ajoneuvo (kylkinro);

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

create table jore.ak_kaavion_suoritteet
(
    kaaid numeric,
    reitunnus varchar,
    suunta numeric,
    lahaika varchar,
    vrkvht boolean,
    autokierto numeric,
    kaltyyppi varchar,
    metrit numeric,
    metritsiir numeric,
    sekunnit numeric,
    sekunnitsiir numeric,
    autopv numeric,
    perustaja varchar,
    perustpvm date,
    muuttaja varchar,
    muutospvm date
);

alter table jore.ak_kaavion_suoritteet owner to postgres;

CREATE INDEX suorite_kaaid ON jore.ak_kaavion_suoritteet (kaaid);
CREATE INDEX suorite_reitti ON jore.ak_kaavion_suoritteet (reitunnus, suunta);
CREATE INDEX suorite_kaaid_reitti ON jore.ak_kaavion_suoritteet (kaaid, reitunnus, suunta);
CREATE INDEX suorite_lahaika ON jore.ak_kaavion_suoritteet (lahaika);
CREATE INDEX suorite_metrit ON jore.ak_kaavion_suoritteet (metrit);

create table jore.ak_kaavion_reitti
(
    kaaid numeric,
    reitunnus varchar,
    atversio numeric,
    suunta1 date,
    suunta2 date
);

alter table jore.ak_kaavion_reitti owner to postgres;

CREATE INDEX kaavio_reitti_kaaid ON jore.ak_kaavion_reitti (kaaid);
CREATE INDEX kaavio_reitti_reitunnus ON jore.ak_kaavion_reitti (reitunnus);

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

CREATE INDEX kalusto_reknro ON jore.jr_kinf_kalusto (reknro);
CREATE INDEX kalusto_liitunnus ON jore.jr_kinf_kalusto (liitunnus);
CREATE INDEX kalusto_kylkinro ON jore.jr_kinf_kalusto (kylkinro);
CREATE INDEX kalusto_tyyppi ON jore.jr_kinf_kalusto (tyyppi);
CREATE INDEX kalusto_paastoluokka ON jore.jr_kinf_kalusto (paastoluokka);

create table jore.jr_linkki
(
    lnkverkko numeric,
    lnkalkusolmu varchar,
    lnkloppusolmu varchar,
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
    lnkhis boolean
);

alter table jore.jr_linkki owner to postgres;

create index jr_linkki_lnkalkusolmu_index on jore.jr_linkki (lnkalkusolmu);
create index jr_linkki_lnkalkusolmu_lnkloppusolmu_index on jore.jr_linkki (lnkalkusolmu, lnkloppusolmu);
create index jr_linkki_lnkloppusolmu_index on jore.jr_linkki (lnkloppusolmu);

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
    lavoimast date,
    laviimvoi date,
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

create index jr_inf_aikataulu_vp_jarjnro_index on jore.jr_inf_aikataulu_vp (jarjnro);
create index jr_inf_aikataulu_vp_paiva_index on jore.jr_inf_aikataulu_vp (paiva);
create index jr_inf_aikataulu_vp_solmutunnus_index on jore.jr_inf_aikataulu_vp (solmutunnus);
create index jr_inf_aikataulu_vp_reitunnus_index on jore.jr_inf_aikataulu_vp (reitunnus);

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

CREATE INDEX operator_id ON jore.jr_inf_kohde (liitunnus);
CREATE INDEX line_id ON jore.jr_inf_kohde (lintunnus);
CREATE INDEX start_date_end_date ON jore.jr_inf_kohde USING brin (kohalkpvm, kohpaattpvm);
CREATE INDEX kohtunnus_operator_line_id ON jore.jr_inf_kohde (kohtunnus, liitunnus, lintunnus);

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

CREATE INDEX kohtunnus ON jore.jr_kilpailukohd (kohtunnus);
CREATE INDEX seuranta ON jore.jr_kilpailukohd (seuranta);
CREATE INDEX kohtunnus_seuranta_not_null ON jore.jr_kilpailukohd (kohtunnus) WHERE seuranta IS NOT NULL;

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

create index jr_reitinlinkki_lnkalkusolmu_index on jore.jr_reitinlinkki (lnkalkusolmu);
create index jr_reitinlinkki_lnkloppusolmu_index on jore.jr_reitinlinkki (lnkloppusolmu);
create index jr_reitinlinkki_reitunnus_index on jore.jr_reitinlinkki (reitunnus);
create index jr_reitinlinkki_relpysakki_index on jore.jr_reitinlinkki (relpysakki);
create index jr_reitinlinkki_suusuunta_index on jore.jr_reitinlinkki (suusuunta);

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

create table jore.jr_kinf_linja3
(
    reitunnus varchar,
    suuvoimast date,
    suuviimvoi date,
    suunta numeric,
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
    nimilyhr varchar
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

create table jore.jr_kinf_reitti
(
    solmu1 varchar,
    solmu2 varchar,
    reitti varchar,
    suunta numeric,
    suuvoimast date,
    suuviimvoi date,
    pysnimi varchar,
    kumajoaika numeric,
    jarjnro numeric,
    pituus numeric,
    kumpituus numeric,
    matkaikpys boolean,
    kutsupys numeric,
    pyssade numeric,
    jarjnro3 numeric,
    pituustyyppi varchar,
    maaranpaa1 varchar,
    maaranpaa1r varchar,
    maaranpaa2 varchar,
    maaranpaa2r varchar,
    ajantaspys numeric
);

alter table jore.jr_kinf_reitti owner to postgres;

create index kinf_reitti_reitti
    on jore.jr_kinf_reitti (reitti);

create index kinf_reitti_suunta
    on jore.jr_kinf_reitti (suunta);

create index kinf_reitti_reitti_suunta
    on jore.jr_kinf_reitti (reitti, suunta);

create index kinf_reitti_solmu1
    on jore.jr_kinf_reitti (solmu1);

create index kinf_reitti_solmu2
    on jore.jr_kinf_reitti (solmu2);

create table jore.jr_linja_vaatimus
(
    lintunnus varchar,
    kookoodi numeric,
    kooselite varchar
);

alter table jore.jr_linja_vaatimus owner to postgres;

create index linja_vaatimus_lintunnus
    on jore.jr_linja_vaatimus (lintunnus);
