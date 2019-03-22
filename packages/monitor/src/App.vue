<template>
    <div id="app">
        <nav class="navbar is-white">
        <div class="container">
            <div class="navbar-brand">
                <a class="navbar-item brand-text" href="../">
                    Weave Landscape Monitor
                </a>
                <div class="navbar-burger burger" data-target="navMenu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div id="navMenu" class="navbar-menu">
                <div class="navbar-start">
                    <router-link to="/" class="navbar-item" active-class="is-active" exact="">Home</router-link>
                    <router-link to="/services" class="navbar-item" active-class="is-active">Services</router-link>
                    <router-link to="/actions" class="navbar-item" active-class="is-active">Actions</router-link>
                    <router-link to="/events" class="navbar-item" active-class="is-active">Events</router-link>
                    <router-link to="/metrics" class="navbar-item" active-class="is-active">Metrics</router-link>
                </div>

            </div>
        </div>
    </nav>
    <!-- END NAV -->
    <div class="container">
        <div class="columns">
            <!-- <div class="column is-3 ">
                <aside class="menu is-hidden-mobile">
                    <p class="menu-label">
                        General
                    </p>
                    <ul class="menu-list">
                        <li><a class="is-active">Dashboard</a></li>
                        <li><a>Customers</a></li>
                    </ul>
                    <p class="menu-label">
                        Administration
                    </p>
                    <ul class="menu-list">
                        <li><a>Team Settings</a></li>
                        <li>
                            <a>Manage Your Team</a>
                            <ul>
                                <li><a>Members</a></li>
                                <li><a>Plugins</a></li>
                                <li><a>Add a member</a></li>
                            </ul>
                        </li>
                        <li><a>Invitations</a></li>
                        <li><a>Cloud Storage Environment Settings</a></li>
                        <li><a>Authentication</a></li>
                    </ul>
                    <p class="menu-label">
                        Transactions
                    </p>
                    <ul class="menu-list">
                        <li><a>Payments</a></li>
                        <li><a>Transfers</a></li>
                        <li><a>Balance</a></li>
                    </ul>
                </aside>
            </div> -->
            <div class="column is-12">
                <!-- <nav class="breadcrumb" aria-label="breadcrumbs">
                    <ul>
                        <li><a href="../">Bulma</a></li>
                        <li><a href="../">Templates</a></li>
                        <li><a href="../">Examples</a></li>
                        <li class="is-active"><a href="#" aria-current="page">Admin</a></li>
                    </ul>
                </nav> -->
                <router-view/>
            </div>
        </div>
    </div>
        <!-- <header>
            <div>
                <img src="@/assets/Logo.png" id="logo">
            </div>
            <div id="nav">
                <router-link to="/">Nodes</router-link> |
                <router-link to="/services">Services</router-link> |
                <router-link to="/actions">Actions</router-link> |
                <router-link to="/events">Events</router-link> |
                <router-link to="/metrics">Metrics</router-link>
            </div>
        </header>
        <div id="content">
            <router-view/>
        </div> -->
    </div>
</template>

<style>
html, body {
  font-family: 'Open Sans', serif;
  font-size: 16px;
  line-height: 1.5;
  height: 100%;
  background: #ECF0F3;
}
nav.navbar {
  border-top: 4px solid #276cda;
  margin-bottom: 1rem;
}
.navbar-item.brand-text {
  font-weight: 300;
}
.navbar-item, .navbar-link {
  font-size: 14px;
  font-weight: 700;
}
.columns {
  width: 100%;
  height: 100%;
  margin-left: 0;
}
.menu-label {
  color: #8F99A3;
  letter-spacing: 1.3;
  font-weight: 700;
}
.menu-list a {
  color: #0F1D38;
  font-size: 14px;
  font-weight: 700;
}
.menu-list a:hover {
  background-color: transparent;
  color: #276cda;
}
.menu-list a.is-active {
  background-color: transparent;
  color: #276cda;
  font-weight: 700;
}
a.navbar-item.is-active {
    border-bottom:#0F1D38;
}
.card {
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.18);
  margin-bottom: 2rem;
}
.card-header-title {
  color: #8F99A3;
  font-weight: 400;
}
.info-tiles {
  margin: 1rem 0;
}
.info-tiles .subtitle {
  font-weight: 300;
  color: #8F99A3;
}
.hero.welcome.is-info {
  background: #36D1DC;
  background: -webkit-linear-gradient(to right, #5B86E5, #36D1DC);
  background: linear-gradient(to right, #5B86E5, #36D1DC);
}
.hero.welcome .title, .hero.welcome .subtitle {
  color: hsl(192, 17%, 99%);
}
.card .content {
  font-size: 14px;
}
.card-footer-item {
  font-size: 14px;
  font-weight: 700;
  color: #8F99A3;
}
.card-footer-item:hover {
}
.card-table .table {
  margin-bottom: 0;
}
.events-card .card-table {
  overflow-y: scroll;
}
</style>
