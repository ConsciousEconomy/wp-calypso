/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import CompactCard from 'components/card';
import EmptyContent from 'components/empty-content';
import getSites from 'state/selectors/get-sites';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PendingListItem from './pending-list-item';
import PurchasesHeader from '../purchases/purchases-list/header';
import PurchasesSite from '../purchases/purchases-site';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

export const requestId = userId => `pending-payments/${ userId }`;

export const requestPendingPayments = userId => {
	return requestHttpData(
		requestId( userId ),
		http( {
			path: '/me/purchases/pending',
			apiVersion: '1',
			method: 'GET',
			body: { userId },
		} ),
		{
			fromApi: () => purchases => [ [ requestId( userId ), purchases ] ],
			freshness: -Infinity,
		}
	);
};

class PendingPayments extends Component {
	componentDidMount = () => {
		requestPendingPayments( this.props.userId );
	};

	render() {
		// todo: error not used - handling
		const { loading, error, pendingPayments, translate } = this.props;

		let content;

		if ( loading ) {
			content = <PurchasesSite isPlaceholder={ true } />;
		} else if ( ! loading && ! pendingPayments.length ) {
			content = (
				<CompactCard className="pending-payments__no-content">
					<EmptyContent
						title={ translate( 'Looking to upgrade?' ) }
						line={ translate(
							'Our plans give your site the power to thrive. ' + 'Find the plan that works for you.'
						) }
						action={ translate( 'Upgrade Now' ) }
						actionURL={ '/plans' }
						illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
					/>
				</CompactCard>
			);
		} else if ( ! loading && pendingPayments.length ) {
			content = (
				<div>
					{ pendingPayments.map( purchase => (
						<PendingListItem key={ purchase.siteId } purchase={ purchase } />
					) ) }
				</div>
			);
		}

		return (
			<Main className="pending-payments">
				<PageViewTracker path="/me/purchases/pending" title="Pending Payments" />
				<MeSidebarNavigation />
				<PurchasesHeader section="pending" />
				{ content }
			</Main>
		);
	}
}

PendingPayments.propTypes = {
	userId: PropTypes.number.isRequired,
	sites: PropTypes.array.isRequired,
	pendingPayments: PropTypes.array.isRequired,
	loading: PropTypes.bool,
	error: PropTypes.object,
};

export default connect( state => {
	const userId = getCurrentUserId( state );
	const sites = getSites( state );

	const response = getHttpData( requestId( userId ) );

	const data = Object.values( response.data || [] );

	const pending = [];

	for ( const purchase of data ) {
		pending.push( {
			siteId: purchase.detail.site_id,
			orderId: purchase.detail.order_id,
			paymentType: purchase.detail.payment_type,
			redirectUrl: purchase.detail.redirect_url,
			totalCostDisplay: purchase.cart.total_cost_display,
			productSlug: purchase.cart.products[ 0 ].product_slug,
			productName: purchase.cart.products[ 0 ].product_name,
			products: purchase.cart.products,
		} );
	}

	return {
		userId,
		sites,
		pendingPayments: pending, //Object.values( response.data || [] ),
		loading: response.state === 'uninitialized' || response.state === 'pending',
		error: response.error,
	};
} )( localize( PendingPayments ) );
