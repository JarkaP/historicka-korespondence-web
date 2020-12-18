<?php
$blekastad_front = get_permalink(carbon_get_theme_option('mb_front'));
$menu_items = wp_get_nav_menu_items(get_nav_menu_locations()['blekastad-menu']);
?>
<nav class="flex flex-col flex-wrap items-start justify-between w-full px-5 py-2 text-sm bg-red-700 lg:flex-row">
    <a class="flex items-center py-2 mr-6 italic text-white" href="<?= $blekastad_front; ?>">
        <div class="hidden w-16 h-auto mr-8 lg:block"></div>
        <?php _e('Korespondence Milady Blekastad', 'hiko'); ?>
    </a>
    <nav class="flex flex-col lg:flex-row">
        <?php foreach ($menu_items as $item) : ?>
            <a href="<?= $item->url; ?>" class="block m-2 text-white" <?= $item->target; ?>>
                <?= $item->title; ?>
            </a>
        <?php endforeach; ?>
    </nav>
</nav>
