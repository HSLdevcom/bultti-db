create schema jore;

alter schema jore owner to postgres;

create table ak_aikataulukausi
(
    aktunnus text not null
        constraint ak_aikataulukausi_pk
            primary key,
    akalkpvm timestamp with time zone,
    akpaattpvm timestamp with time zone,
    kausi smallint,
    aikajakso text,
    kommentti text,
    perustaja text,
    perustpvm timestamp with time zone,
    muuttaja text,
    muutospvm timestamp with time zone
);

alter table ak_aikataulukausi owner to postgres;

create table ak_kaavio
(
    aktunnus text,
    kaatunnus text,
    kaavoimast text,
    pvtyyppi text,
    kaaversio smallint,
    kaaid text not null
        constraint ak_kaavio_pk
            primary key,
    kaaviimvoi text,
    kaanimi text,
    tyyppi smallint,
    aikataulupala text,
    kohtunnus text,
    kuormaika text,
    perustaja text,
    perustpvm text,
    muuttaja text,
    muutospvm text,
    haspvtyyppi text
);

alter table ak_kaavio owner to postgres;

create table ak_kaavion_lahto
(
    kaaid text,
    reitunnus text,
    suunta smallint,
    lahaika text,
    ajoaika text,
    kaltyyppi text,
    ajotyyppi text,
    srtunnus text,
    autonumero text,
    kommentti text,
    voimok text,
    vrkvht text,
    viitem text,
    perustaja text,
    perustpvm timestamp with time zone,
    muuttaja text,
    muutospvm timestamp with time zone,
    termaika text,
    elpymisaika text,
    pakollkaltyyppi text,
    liitunnus text,
    saapaika text
);

alter table ak_kaavion_lahto owner to postgres;

create table jr_ajoneuvo
(
    id text,
    status text,
    liitunnus text,
    varikko text,
    reknro text,
    kylkinro text,
    kaltyyppi text,
    kalluokka text,
    lattiakorkeus text,
    alkutark text,
    tarkpvm text,
    kohtunnus1 text,
    kohtunnus2 text,
    ulkoilme text,
    alustavalmist text,
    alustamalli text,
    korivalmist text,
    korimalli text,
    pituus text,
    korkeus text,
    polttoaine text,
    hybridi text,
    oviratkaisu text,
    rekpvm text,
    kayttpvm text,
    voimast text,
    viimvoi text,
    istumapaikat text,
    kaantoistuimet text,
    lvaunupaikat text,
    paastoluokka text,
    noxpaastot text,
    pmpaastot text,
    co2paastot text,
    sisamelu text,
    ulkomelu text,
    matkilmast text,
    kuljilmast text,
    matklasklaite text,
    laukkuteline text,
    helmilaite text,
    tallkamera text,
    turvaohjaamo text,
    palsamjarj text,
    kulutusseuranta text,
    alkolukko text,
    ovikamera text,
    lisalammitin text,
    teholammitin text,
    startstop text,
    pakokaasupuhd text,
    peruutuskamera text,
    ajonvakautus text,
    turvateli text,
    niiaustoiminto text,
    pistoke text,
    valoetunro text,
    varuste1 text,
    varuste2 text,
    varuste3 text,
    varuste4 text,
    varuste5 text,
    varuste6 text,
    seliteyht text,
    selitehsl text,
    tallentaja text,
    tallpvm text,
    ajoneuvoid text,
    ilmentymanjnro text,
    vartunnus text,
    kontunnus text,
    lijlaitteet text,
    yliikaisyys text
);

alter table jr_ajoneuvo owner to postgres;

create table jr_eritpvkalent
(
    eritpoikpvm timestamp with time zone not null,
    eritpaiva text not null,
    eritviikpaiva text,
    eriteimuita boolean,
    eritkuka text,
    eritviimpvm timestamp with time zone,
    eritjunat boolean,
    constraint jr_eritpvkalent_pk
        primary key (eritpoikpvm, eritpaiva)
);

alter table jr_eritpvkalent owner to postgres;

create table jr_inf_aikataulu_vp
(
    solmutunnus text,
    reitunnus text,
    suunta smallint,
    paiva text,
    jarjnro smallint,
    vrkvht text,
    ohitustunnit smallint,
    ohitusminuutit smallint,
    matlatt boolean,
    lavoimast timestamp with time zone,
    laviimvoi timestamp with time zone,
    tyyppi smallint,
    voimok text,
    viitem text,
    kaltyyppi text,
    tvrkvht text,
    tohitustunnit smallint,
    tohitusminuutit smallint,
    maksviivaika text,
    id text not null
        constraint jr_inf_aikataulu_vp_pk
            primary key,
    ajotyyppi text
);

alter table jr_inf_aikataulu_vp owner to postgres;

create table jr_inf_eritpv
(
    koodi text not null
        constraint jr_inf_eritpv_pk
            primary key,
    selite text
);

alter table jr_inf_eritpv owner to postgres;

create table jr_inf_kohde
(
    kohtunnus text not null,
    kohalkpvm date,
    kohpaattpvm date,
    kohtilorg text,
    ilmoitus1 text,
    ilmoitus2 text,
    selite text,
    lintunnus text not null,
    liitunnus text not null,
    liirooli text,
    liialkpvm date not null,
    liipaattpvm date not null,
    koulutus text,
    helmi text,
    perehdytys text,
    constraint jr_inf_kohde_pk
        primary key (kohtunnus, lintunnus, liitunnus, liialkpvm, liipaattpvm)
);

alter table jr_inf_kohde owner to postgres;

create table jr_inf_liik
(
    liitunnus text not null
        constraint jr_inf_liik_pk
            primary key,
    liinimi text
);

alter table jr_inf_liik owner to postgres;

create table jr_kilpailukohd
(
    kohtunnus text,
    kohtilorg text,
    kohalkpvm text,
    kohpaattpvm text,
    liikaloituspvm text,
    muuttunut text,
    muutospvm text,
    kohnimi text,
    liitunnus text,
    kohtarjouspvm text,
    kohindeksipvm text,
    prosentti text,
    prosentti2 text,
    valtyyppi text,
    kmhinta text,
    tuntihinta text,
    pvhinta text,
    promraja text,
    ajamkerr1 text,
    ajamkerr2 text,
    ylimkerr text,
    kohkuka text,
    kohviimpvm text,
    tilnro text,
    ilmoitus1 text,
    ilmoitus2 text,
    selite text,
    perehdytys text,
    koulutus text,
    helmi text,
    sopimusno text,
    sloppupvm text,
    optiomahd text,
    optiokayt text,
    lisatietoa text,
    tyyppi text,
    sopimustyyppi text,
    kyssanktio1 text,
    kyssanktio2 text,
    kyssanktio3 text,
    seuranta text,
    tavoitetaso text,
    vertailutaso_alku text,
    vertailutaso_loppu text,
    vertailukerroin text,
    louhinkoodi text
);

alter table jr_kilpailukohd owner to postgres;

create table jr_konserni
(
    kontunnus text not null
        constraint jr_konserni_pk
            primary key,
    konlyhenne text,
    konnimi text,
    tallpvm timestamp with time zone,
    tallentaja text,
    ytunnus text,
    status text
);

alter table jr_konserni owner to postgres;

create table jr_koodisto
(
    koolista text,
    koojarjestys smallint,
    kookoodi text,
    kooselite text,
    koonumero smallint,
    tyyppinumero1 text,
    tyyppinimi1 text,
    tyyppinimi2 text,
    koodityyppi text
);

alter table jr_koodisto owner to postgres;

