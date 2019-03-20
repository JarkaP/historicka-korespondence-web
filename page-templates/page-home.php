<?php

/* Template Name: Home Page */

get_header(); ?>

<?php while (have_posts()) : ?>
    <?php

    the_post();

    require get_template_directory() . '/partials/entry-header.php';

    echo do_shortcode('[breadcrumbs]'); ?>

    <h1>
        <?php the_title(); ?>
    </h1>

    <?php

    the_content();

    require get_template_directory() . '/partials/entry-footer.php'; ?>

<?php endwhile;

get_footer();
