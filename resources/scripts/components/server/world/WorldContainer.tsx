import React from 'react';
import { ServerContext } from '@/state/server';
import { useStoreState } from 'easy-peasy';
import ChangeLevelPropertiesBox from '@/components/server/world/ChangeLevelPropertiesBox';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';

export default () => {
    const username = useStoreState((state) => state.user.data!.username);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const sftp = ServerContext.useStoreState((state) => state.server.data!.sftpDetails, isEqual);

    return (
        <ServerContentBlock title={'Settings'}>
            <FlashMessageRender byKey={'settings'} css={tw`mb-4`} />
            <div css={tw`md:flex`}>
                <div css={tw`w-full mt-6 md:flex-1 md:mt-0`}>
                    <div css={tw`mb-6 md:mb-10`}>
                        <ChangeLevelPropertiesBox />
                    </div>
                </div>
            </div>
        </ServerContentBlock>
    );
};
