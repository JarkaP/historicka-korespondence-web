<?php

/*
Template Name: Browse DB
*/

get_header();

the_post();
?>

<h1 class="my-5 mx-3">
    <?php the_title(); ?>
</h1>
<script>
    var lettersSuffix = '<?= carbon_get_post_meta(get_the_ID(), 'index_endpoint'); ?>';
</script>
<div class="row main-content mb-5" id="letters">
    <div class="col-md-2">
        <div id="letters-filter" class="d-none filters">
            filtry
        </div>
    </div>
    <div class="col-md-10">
        <p id="counter" class="d-none h6">
            Showing <span id="search-count"></span> items from <span id="total-count"></span> total items
        </p>
        <div id="letters-table"></div>
    </div>
</div>

<?php

get_footer();
