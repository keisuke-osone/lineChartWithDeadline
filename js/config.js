// csvファイルのパス
var DATA_PATH = 'data/'

// position parameters
var margin = {top: 20, right:10, bottom: 50, left: 10},
    width = document.documentElement.clientWidth - margin.left - margin.right;

// 州の名前の高さ
var state_height = 1.0 * width / 50;

var height = (document.documentElement.clientWidth - margin.top - margin.bottom) * 9.0 / 16 + state_height * 2;
var rev_demo_height = (document.documentElement.clientWidth - margin.top - margin.bottom) * 9.0 / 16 + state_height * 8;

// 地図の拡大率
var map_scale = 1000.0 * width / 960;

// 青地図の系列の大きさ
var legend_height = 1.0 * width / 7;
var legend_width = 1.0 * width / 5;
var legend_margin_top = -1.0 * legend_height - state_height;

// 赤青地図の系列の大きさ
var rev_demo_legend_height = 1.0 * width / 10;
var rev_demo_legend_width = 1.0 * width / 4.6;
var rev_demo_legend_margin_top = -1.0 * rev_demo_legend_height - state_height * 7;

var demographic_width = width;
var demographics_margin = -1.0 * state_height * 1.5;
var rev_demo_demographics_margin = -1.0 * state_height * 6;

var font_size = state_height * 0.6
var rev_demo_font_size = state_height * 0.4
var padding = state_height * 0.05