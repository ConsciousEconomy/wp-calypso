/** @format */
/**
 * Internal dependencies
 */
import isCalypsoifyGutenbergEnabled from 'state/selectors/is-calypsoify-gutenberg-enabled';
import { getSiteAdminUrl, getSiteSlug } from 'state/sites/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';

export const getEditorUrl = (
	state,
	siteId,
	postId = null,
	postType = 'post',
	{ skipSelectedEditorCheck } = {}
) => {
	if ( isCalypsoifyGutenbergEnabled( state, siteId, { skipSelectedEditorCheck } ) ) {
		const siteAdminUrl = getSiteAdminUrl( state, siteId );

		if ( postId ) {
			return `${ siteAdminUrl }post.php?post=${ postId }&action=edit&calypsoify=1`;
		}
		if ( 'post' === postType ) {
			return `${ siteAdminUrl }post-new.php?calypsoify=1`;
		}
		return `${ siteAdminUrl }post-new.php?post_type=${ postType }&calypsoify=1`;
	}

	if ( postId ) {
		return getEditorPath( state, siteId, postId, postType );
	}

	const siteSlug = getSiteSlug( state, siteId );

	if ( 'post' === postType || 'page' === postType ) {
		return `/${ postType }/${ siteSlug }`;
	}
	return `/edit/${ postType }/${ siteSlug }`;
};

export default getEditorUrl;
